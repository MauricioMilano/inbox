import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSiteToken } from '@/lib/utils'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const sites = await prisma.site.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { messages: true } },
      messages: {
        where: { status: 'nova' },
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const sitesWithCounts = sites.map((site) => ({
    id: site.id,
    name: site.name,
    domain: site.domain,
    notificationEmail: site.notificationEmail,
    logoPath: site.logoPath,
    token: site.token,
    newCount: site.messages.length,
    totalCount: site._count.messages,
    createdAt: site.createdAt,
  }))

  return NextResponse.json({ sites: sitesWithCounts })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const domain = formData.get('domain') as string
    const notificationEmail = formData.get('notificationEmail') as string
    const logo = formData.get('logo') as File | null

    if (!name || !domain || !notificationEmail) {
      return NextResponse.json(
        { error: 'Nome, domínio e email são obrigatórios' },
        { status: 400 }
      )
    }

    let logoPath: string | null = null

    if (logo && logo.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
      await mkdir(uploadsDir, { recursive: true })

      const bytes = await logo.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `${Date.now()}-${logo.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filepath = path.join(uploadsDir, filename)
      await writeFile(filepath, buffer)
      logoPath = `/uploads/logos/${filename}`
    }

    const token = generateSiteToken()

    const site = await prisma.site.create({
      data: {
        userId: user.id,
        name,
        domain,
        notificationEmail,
        logoPath,
        token,
      },
    })

    return NextResponse.json({
      ok: true,
      site: {
        id: site.id,
        name: site.name,
        domain: site.domain,
        notificationEmail: site.notificationEmail,
        logoPath: site.logoPath,
        token: site.token,
        newCount: 0,
        totalCount: 0,
      },
    })
  } catch (error) {
    console.error('Create site error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar site' },
      { status: 500 }
    )
  }
}
