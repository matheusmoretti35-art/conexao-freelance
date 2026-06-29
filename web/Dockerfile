# ==============================================================================
# PROJETO: Conexão Freelance
# ARQUIVO: web/Dockerfile
# DESCRIÇÃO: Dockerfile de produção multietapa (Multi-stage build) para o Frontend Web com Nginx
# ==============================================================================

# ETAPA 1: Build da Aplicação Web
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ETAPA 2: Servidor HTTP Nginx Otimizado para Produção
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
