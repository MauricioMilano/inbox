import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params

  const site = await prisma.site.findFirst({
    where: { id, userId: user.id },
  })

  if (!site) {
    return NextResponse.json({ error: 'Site não encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    site: {
      id: site.id,
      name: site.name,
      domain: site.domain,
      notificationEmail: site.notificationEmail,
      logoPath: site.logoPath,
      token: site.token,
    },
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.site.findFirst({
    where: { id, userId: user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Site não encontrado' }, { status: 404 })
  }

  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const domain = formData.get('domain') as string
    const notificationEmail = formData.get('notificationEmail') as string
    const logo = formData.get('logo') as File | null

    const updateData: Record<string, string> = {}
    if (name) updateData.name = name
    if (domain) updateData.domain = domain
    if (notificationEmail) updateData.notificationEmail = notificationEmail

    if (logo && logo.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
      await mkdir(uploadsDir, { recursive: true })

      const bytes = await logo.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `${Date.now()}-${logo.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filepath = path.join(uploadsDir, filename)
      await writeFile(filepath, buffer)
      updateData.logoPath = `/uploads/logos/${filename}`

      // Delete old logo if exists
      if (existing.logoPath) {
        const oldPath = path.join(process.cwd(), 'public', existing.logoPath)
        try {
          await unlink(oldPath)
        } catch { /* ignore */ }
      }
    }

    const site = await prisma.site.update({
      where: { id },
      data: updateData,
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
      },
    })
  } catch (error) {
    console.error('Update site error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar site' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.site.findFirst({
    where: { id, userId: user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Site não encontrado' }, { status: 404 })
  }

  // Delete old logo if exists
  if (existing.logoPath) {
    const oldPath = path.join(process.cwd(), 'public', existing.logoPath)
    try {
      await unlink(oldPath)
    } catch { /* ignore */ }
  }

  await prisma.site.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
