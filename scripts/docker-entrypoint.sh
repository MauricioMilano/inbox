#!/bin/sh
# Usar /bin/sh pois Alpine não tem bash por padrão

set -e

echo "🚀 Iniciando Milano Inbox..."

# Verifica se o banco de dados já existe
if [ ! -f "prisma/dev.db" ]; then
    echo "📦 Banco de dados não encontrado. Criando..."
    npx prisma db push
    echo "🌱 Populando com dados demo..."
    npx tsx prisma/seed.ts
    echo "✅ Banco de dados criado com sucesso!"
else
    echo "✅ Banco de dados já existe, pulando criação."
fi

echo "🎯 Iniciando aplicação..."
exec "$@"