import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const siteId = searchParams.get('siteId')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  if (!siteId) {
    return NextResponse.json({ error: 'Site ID é obrigatório' }, { status: 400 })
  }

  // Verify site belongs to user
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user.id },
  })

  if (!site) {
    return NextResponse.json({ error: 'Site não encontrado' }, { status: 404 })
  }

  const where: Record<string, unknown> = { siteId }

  if (status && status !== 'todas') {
    where.status = status
  }

  if (search) {
    where.OR = [
      { senderName: { contains: search } },
      { senderEmail: { contains: search } },
      { content: { contains: search } },
      { subject: { contains: search } },
    ]
  }

  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ messages })
}
