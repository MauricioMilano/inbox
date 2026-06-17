import nodemailer from 'nodemailer'

interface SmtpConfig {
  smtpEnabled: boolean
  smtpHost: string | null
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string | null
  smtpPass: string | null
  smtpFromEmail: string | null
  smtpFromName: string | null
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(config: SmtpConfig, options: EmailOptions): Promise<boolean> {
  // Se SMTP não estiver habilitado, não envia
  if (!config.smtpEnabled || !config.smtpHost || !config.smtpUser || !config.smtpPass) {
    console.log('[Email] SMTP não configurado, pulando envio')
    return false
  }

  try {
    // Cria o transporter
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    })

    // Envia o email
    const info = await transporter.sendMail({
      from: `"${config.smtpFromName || 'Milano Inbox'}" <${config.smtpFromEmail || config.smtpUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    })

    console.log('[Email] Enviado com sucesso:', info.messageId)
    return true
  } catch (error) {
    console.error('[Email] Erro ao enviar:', error)
    return false
  }
}

export async function sendNewMessageNotification(
  config: SmtpConfig,
  siteName: string,
  siteDomain: string,
  message: {
    senderName: string | null
    senderEmail: string | null
    subject: string | null
    content: string | null
    createdAt: Date
  }
): Promise<boolean> {
  if (!config.smtpEnabled) {
    return false
  }

  const truncatedContent = message.content
    ? message.content.length > 200
      ? message.content.substring(0, 200) + '...'
      : message.content
    : ''

  const subject = `[${siteName}] Nova mensagem de ${message.senderName || message.senderEmail || 'Visitante'}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; }
    .message-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .meta { color: #64748b; font-size: 14px; margin-bottom: 10px; }
    .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    .footer { padding: 15px; text-align: center; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px;">📬 Nova mensagem recebida</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">${siteName}</p>
    </div>
    <div class="content">
      <div class="meta">
        <strong>De:</strong> ${message.senderName || 'Sem nome'} ${message.senderEmail ? `(${message.senderEmail})` : ''}<br>
        <strong>Quando:</strong> ${new Date(message.createdAt).toLocaleString('pt-BR')}<br>
        ${message.subject ? `<strong>Assunto:</strong> ${message.subject}<br>` : ''}
      </div>
      <div class="message-box">
        ${message.content ? message.content.replace(/\n/g, '<br>') : '<em>Sem conteúdo</em>'}
      </div>
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/sites" class="btn">
        Ver no Milano Inbox →
      </a>
    </div>
    <div class="footer">
      Enviado por Milano Inbox · ${siteDomain}
    </div>
  </div>
</body>
</html>
`

  return sendEmail(config, {
    to: config.smtpFromEmail || config.smtpUser || '',
    subject,
    html,
  })
}

export async function testSmtpConnection(config: SmtpConfig): Promise<{ success: boolean; error?: string }> {
  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
    return { success: false, error: 'Preencha todos os campos de SMTP' }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
      connectionTimeout: 10000,
    })

    await transporter.verify()
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return { success: false, error: message }
  }
}
