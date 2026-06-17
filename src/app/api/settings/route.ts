import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { testSmtpConnection } from '@/lib/email'

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      name,
      smtpEnabled,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass,
      smtpFromEmail,
      smtpFromName,
      testConnection,
    } = body

    // Se pediu pra testar conexão, testa antes de salvar
    if (testConnection && smtpEnabled) {
      const result = await testSmtpConnection({
        smtpEnabled: true,
        smtpHost,
        smtpPort: smtpPort || 587,
        smtpSecure: smtpSecure !== false,
        smtpUser,
        smtpPass,
        smtpFromEmail,
        smtpFromName,
      })

      return NextResponse.json(result)
    }

    // Atualiza o perfil
    const updateData: Record<string, unknown> = {}

    if (name !== undefined) updateData.name = name
    if (smtpEnabled !== undefined) updateData.smtpEnabled = smtpEnabled
    if (smtpHost !== undefined) updateData.smtpHost = smtpHost || null
    if (smtpPort !== undefined) updateData.smtpPort = smtpPort || 587
    if (smtpSecure !== undefined) updateData.smtpSecure = smtpSecure
    if (smtpUser !== undefined) updateData.smtpUser = smtpUser || null
    if (smtpFromEmail !== undefined) updateData.smtpFromEmail = smtpFromEmail || null
    if (smtpFromName !== undefined) updateData.smtpFromName = smtpFromName || null

    // Só atualiza senha se forneceu uma nova
    if (smtpPass !== undefined && smtpPass) {
      updateData.smtpPass = smtpPass
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        smtpEnabled: true,
        smtpHost: true,
        smtpPort: true,
        smtpSecure: true,
        smtpUser: true,
        smtpPass: true,
        smtpFromEmail: true,
        smtpFromName: true,
      },
    })

    return NextResponse.json({
      ok: true,
      user: {
        ...updatedUser,
        hasSmtpPass: !!updatedUser.smtpPass,
        smtpPass: undefined,
      },
    })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}
