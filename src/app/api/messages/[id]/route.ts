import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params

  const message = await prisma.message.findUnique({
    where: { id },
    include: { site: { select: { userId: true } } },
  })

  if (!message || message.site.userId !== user.id) {
    return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 })
  }

  return NextResponse.json({ message })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { status } = body

  const message = await prisma.message.findUnique({
    where: { id },
    include: { site: { select: { userId: true } } },
  })

  if (!message || message.site.userId !== user.id) {
    return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 })
  }

  const validStatuses = ['nova', 'lida', 'respondida', 'arquivada', 'spam']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const updated = await prisma.message.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ ok: true, message: updated })
}
