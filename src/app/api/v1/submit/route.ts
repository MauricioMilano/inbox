import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Rate limiting - simple in-memory store
const rateLimit = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string, token: string): boolean {
  const now = Date.now()
  const ipKey = `ip:${ip}`
  const tokenKey = `token:${token}`

  // IP limit: 10 per minute
  const ipLimit = rateLimit.get(ipKey) || { count: 0, resetAt: now + 60000 }
  if (now > ipLimit.resetAt) {
    ipLimit.count = 0
    ipLimit.resetAt = now + 60000
  }
  ipLimit.count++
  rateLimit.set(ipKey, ipLimit)

  if (ipLimit.count > 10) return false

  // Token limit: 100 per hour
  const tokenLimit = rateLimit.get(tokenKey) || { count: 0, resetAt: now + 3600000 }
  if (now > tokenLimit.resetAt) {
    tokenLimit.count = 0
    tokenLimit.resetAt = now + 3600000
  }
  tokenLimit.count++
  rateLimit.set(tokenKey, tokenLimit)

  if (tokenLimit.count > 100) return false

  return true
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-site-token') || 
                  request.headers.get('X-Site-Token')

    if (!token) {
      return NextResponse.json({
        ok: false,
        error: 'missing_token',
        message: 'Token do site é obrigatório',
      }, { status: 400 })
    }

    // Find site by token
    const site = await prisma.site.findUnique({
      where: { token },
    })

    if (!site) {
      return NextResponse.json({
        ok: false,
        error: 'invalid_token',
        message: 'Token do site inválido ou expirado',
      }, { status: 403 })
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                request.headers.get('x-real-ip') ||
                'unknown'
    
    if (!checkRateLimit(ip, token)) {
      return NextResponse.json({
        ok: false,
        error: 'rate_limit',
        message: 'Limite de envios excedido. Tente novamente em alguns minutos.',
      }, { status: 429 })
    }

    // Parse body (JSON or form-data)
    let data: Record<string, string | number | boolean | null | undefined>
    
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      data = await request.json()
    } else {
      const formData = await request.formData()
      // Convert FormDataEntryValue to string, ignoring File objects
      const entries: [string, string][] = []
      formData.forEach((value, key) => {
        entries.push([key, String(value)])
      })
      data = Object.fromEntries(entries)
    }

    // Honeypot check - if filled, silently "succeed" but don't save
    const honeypot = data._honey as string
    if (honeypot) {
      // Return success but don't save
      return NextResponse.json({
        ok: true,
        id: `sub_${Date.now()}`,
        received_at: new Date().toISOString(),
      })
    }

    // Extract metadata
    const metadata = {
      ip,
      userAgent: request.headers.get('user-agent') || null,
      referer: request.headers.get('referer') || data._page_url as string || null,
      submittedAt: new Date().toISOString(),
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        siteId: site.id,
        status: 'nova',
        senderName: data.name as string || null,
        senderEmail: data.email as string || null,
        senderPhone: data.phone as string || null,
        subject: data.subject as string || null,
        content: data.message as string || null,
        metadata: JSON.stringify(metadata),
      },
    })

    // TODO: Send email notification (requires email service setup)
    // For now, just log it
    console.log(`[Milano Inbox] Nova mensagem para ${site.name}:`, {
      id: message.id,
      from: message.senderName,
      email: message.senderEmail,
    })

    return NextResponse.json({
      ok: true,
      id: message.id,
      received_at: message.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json({
      ok: false,
      error: 'server_error',
      message: 'Erro interno ao processar mensagem',
    }, { status: 500 })
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Site-Token, X-Site-Token',
    },
  })
}
