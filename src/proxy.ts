import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// CORS liberado para qualquer origem.
// Aplica-se a todas as rotas /api/* (incluindo preflight OPTIONS).
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Site-Token, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
}

export function proxy(request: NextRequest) {
  // Responde preflight (OPTIONS) direto aqui — não chega na rota.
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders })
  }

  // Para requisições normais, deixa passar e injeta os headers CORS no response.
  const response = NextResponse.next()

  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set(
    'Access-Control-Allow-Methods',
    corsHeaders['Access-Control-Allow-Methods'],
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    corsHeaders['Access-Control-Allow-Headers'],
  )
  response.headers.set('Access-Control-Max-Age', corsHeaders['Access-Control-Max-Age'])
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  return response
}

export const config = {
  matcher: '/api/:path*',
}
