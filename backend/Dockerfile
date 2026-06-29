# ==============================================================================
# PROJETO: Conexão Freelance
# ARQUIVO: backend/Dockerfile
# DESCRIÇÃO: Dockerfile de produção multietapa (Multi-stage build) para Node.js
# ==============================================================================

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
