import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Verificando banco de dados...')

  // Verifica se já existe usuário demo
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@milano.com' },
  })

  if (existingUser) {
    console.log('✅ Banco já está configurado (usuário demo existe)')
    console.log('   Email: demo@milano.com')
    console.log('   Senha: demo123')
    return
  }

  console.log('🌱 Criando dados demo...')

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 12)
  const user = await prisma.user.create({
    data: {
      email: 'demo@milano.com',
      passwordHash,
      name: 'Demo User',
    },
  })

  console.log('✅ Created demo user: demo@milano.com / demo123')

  // Create demo sites
  const sites = [
    {
      name: 'Pizzaria do Tonho',
      domain: 'pizzariadotonho.com.br',
      notificationEmail: 'contato@pizzariadotonho.com.br',
      token: 'mb_demo_pizzaria1234567890',
    },
    {
      name: 'Clínica Sorriso',
      domain: 'clinicasorriso.com.br',
      notificationEmail: 'agenda@clinicasorriso.com.br',
      token: 'mb_demo_clinica1234567890',
    },
    {
      name: 'Escritório Lima',
      domain: 'escritorio-lima.adv.br',
      notificationEmail: 'contato@escritorio-lima.adv.br',
      token: 'mb_demo_escritor1234567890',
    },
  ]

  for (const siteData of sites) {
    const site = await prisma.site.create({
      data: {
        userId: user.id,
        name: siteData.name,
        domain: siteData.domain,
        notificationEmail: siteData.notificationEmail,
        token: siteData.token,
      },
    })

    console.log(`✅ Created site: ${site.name}`)
  }

  // Create demo messages for Pizzaria do Tonho
  const pizzaria = await prisma.site.findFirst({ where: { token: 'mb_demo_pizzaria1234567890' } })
  
  if (pizzaria) {
    const messages = [
      {
        status: 'nova',
        senderName: 'João Silva',
        senderEmail: 'joao@email.com',
        senderPhone: '+55 11 99999-9999',
        subject: 'Pedido de orçamento',
        content: 'Olá! Gostaria de pedir uma pizza margherita grande para entrega na Rua das Flores, 234. Qual o valor e tempo de entrega?',
        metadata: JSON.stringify({
          ip: '187.123.45.67',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0.0.0',
          referer: 'https://pizzariadotonho.com.br/contato',
        }),
      },
      {
        status: 'nova',
        senderName: 'Maria Souza',
        senderEmail: 'maria.souza@gmail.com',
        senderPhone: '+55 21 98888-7777',
        subject: 'Reserva para sábado',
        content: 'Bom dia! Gostaria de reservar uma mesa para 4 pessoas no sábado às 20h. Temos crianças pequenas. Obrigada!',
        metadata: JSON.stringify({
          ip: '200.145.67.89',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
          referer: 'https://pizzariadotonho.com.br/',
        }),
      },
      {
        status: 'lida',
        senderName: 'Carlos Lima',
        senderEmail: 'carlos.lima@empresa.com.br',
        subject: 'Entrega no centro',
        content: 'Boa tarde! Vocês entregam no centro da cidade? Qual o valor mínimo para entrega?',
        metadata: JSON.stringify({
          ip: '189.45.123.78',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0',
          referer: 'https://pizzariadotonho.com.br/cardapio',
        }),
      },
    ]

    for (const msg of messages) {
      await prisma.message.create({
        data: { ...msg, siteId: pizzaria.id },
      })
    }

    console.log('✅ Created 3 demo messages for Pizzaria do Tonho')
  }

  // Create demo messages for Clínica Sorriso
  const clinica = await prisma.site.findFirst({ where: { token: 'mb_demo_clinica1234567890' } })
  
  if (clinica) {
    const messages = [
      {
        status: 'nova',
        senderName: 'Ana Pereira',
        senderEmail: 'ana.pereira@email.com',
        senderPhone: '+55 31 98777-6666',
        subject: 'Agendamento de limpeza',
        content: 'Olá! Gostaria de agendar uma limpeza dental para a próxima semana. Segunda ou terça pela manhã. Obrigada!',
        metadata: JSON.stringify({
          ip: '201.45.123.90',
          userAgent: 'Mozilla/5.0 (Android 14; Mobile) Chrome/126.0.0.0',
          referer: 'https://clinicasorriso.com.br/servicos',
        }),
      },
    ]

    for (const msg of messages) {
      await prisma.message.create({
        data: { ...msg, siteId: clinica.id },
      })
    }

    console.log('✅ Created 1 demo message for Clínica Sorriso')
  }

  console.log('\n🎉 Banco configurado com sucesso!')
  console.log('\nLogin credentials:')
  console.log('  Email: demo@milano.com')
  console.log('  Password: demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
