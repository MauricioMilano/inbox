# Milano Inbox - Dockerfile
# Multi-stage build para减小 imagem final

# ─────────────────────────────────────────────────────────────
# Stage 1: Dependencies
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copia só package files pra cache
COPY package.json package-lock.json* ./

# Instala dependências
RUN npm ci --ignore-scripts

# Copia binaries nativos pro ambiente de runtime
RUN npm rebuild


RUN npm install 

# Gera Prisma Client
RUN npx prisma generate



# Build da aplicação
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# ─────────────────────────────────────────────────────────────
# Stage 3: Runtime
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Instala dumb-init pra tratamento de sinais
RUN apk add --no-cache dumb-init

# Cria usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copia node_modules e built app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/.env* ./

# Copia script de entrypoint
COPY --chown=nodejs:nodejs scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Usuário não-root
USER nodejs

# Porta exposta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Entrypoint - verifica/migra banco e inicia app
ENTRYPOINT ["/docker-entrypoint.sh"]

# Comando padrão
CMD ["npm", "start"]
