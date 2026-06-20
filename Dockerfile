# Milano Inbox - Dockerfile
# Multi-stage build para reduzir imagem final

# ─────────────────────────────────────────────────────────────
# Stage 1: Dependencies
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

# OpenSSL é necessário para o Prisma Schema Engine funcionar no Alpine (musl)
# binaryTarget "linux-musl-openssl-3.0.x" em prisma/schema.prisma requer libssl
RUN apk add --no-cache openssl

WORKDIR /app

# Copia só package files pra cache
COPY package.json package-lock.json* ./

# Instala dependências (inclui devDependencies para tsx/prisma)
RUN npm install --include=dev
RUN npm rebuild

# ─────────────────────────────────────────────────────────────
# Stage 2: Build
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# OpenSSL para o prisma generate rodar o schema engine
RUN apk add --no-cache openssl

WORKDIR /app

# Copia dependências do stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gera Prisma Client
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 3: Runtime
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Instala dumb-init (sinais) + OpenSSL (Prisma Schema Engine) + wget (healthcheck)
# Sem OpenSSL, `npx prisma db push` falha com:
#   "Could not parse schema engine response: ... Error loading schema engine ..."
#   "Please manually install OpenSSL and try installing Prisma again."
# Sem wget, o HEALTHCHECK falha pois node:20-alpine não vem com wget.
RUN apk add --no-cache dumb-init openssl wget

# Cria usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Define variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001

# Copia node_modules e built app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Garante que o usuário nodejs tem permissão no diretório prisma
# (necessário porque o volume sobrescreve com permissões de root)
RUN chown -R nodejs:nodejs /app/prisma && \
    chmod -R 755 /app/prisma

# Copia script de entrypoint (caminho consistente com ENTRYPOINT)
COPY --chown=nodejs:nodejs scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Usuário não-root
USER nodejs

# Porta exposta
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Entrypoint - verifica/migra banco e inicia app
ENTRYPOINT ["docker-entrypoint.sh"]

# Comando padrão
CMD ["npm", "start"]
