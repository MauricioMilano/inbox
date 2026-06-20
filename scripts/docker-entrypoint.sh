#!/bin/sh
# Usar /bin/sh pois Alpine não tem bash por padrão

set -e

echo "🚀 Iniciando Milano Inbox..."

# ─── DEBUG: Diagnóstico de ambiente ───
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 DIAGNÓSTICO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📂 WORKDIR:            $(pwd)"
echo "👤 USER:               $(whoami) (uid=$(id -u))"
echo "🌐 NODE_ENV:           ${NODE_ENV:-<não definido>}"
echo "🔌 PORT:               ${PORT:-<não definido>}"
echo "🗄️  DATABASE_URL:       ${DATABASE_URL:-<NÃO DEFINIDO!>}"
echo "🔑 JWT_SECRET:         ${JWT_SECRET:+<definido>}${JWT_SECRET:-<NÃO DEFINIDO!>}"
echo "📁 /app/prisma existe? $([ -d /app/prisma ] && echo SIM || echo NAO)"
echo "📁 /app/prisma conteúdo:"
ls -la /app/prisma 2>/dev/null || echo "  (não foi possível listar)"
echo "📁 /app conteúdo:"
ls -la /app 2>/dev/null | head -20
echo "🔎 Procurando dev.db em /app..."
find /app -name "dev.db" 2>/dev/null || echo "  (nenhum dev.db encontrado)"
echo "🔎 Prisma versão:      $(npx prisma --version 2>/dev/null | head -3 || echo 'não foi possível obter')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# ─── FIM DEBUG ───

# Verifica se o banco de dados já existe
if [ ! -f "prisma/dev.db" ]; then
    echo "📦 Banco de dados não encontrado em $(pwd)/prisma/dev.db. Criando..."
    echo "🛠️  Rodando: npx prisma db push"
    npx prisma db push
    echo "🌱 Populando com dados demo..."
    npx tsx prisma/seed.ts
    echo "✅ Banco de dados criado com sucesso!"
else
    echo "✅ Banco de dados já existe em $(pwd)/prisma/dev.db, pulando criação."
fi

echo "🎯 Iniciando aplicação..."
exec "$@"