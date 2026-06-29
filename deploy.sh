#!/bin/bash
# ==============================================================================
# PROJETO: Conexão Freelance
# ARQUIVO: deploy.sh
# DESCRIÇÃO: Script Bash de Automação de Compilação e Deploy de Produção
# ==============================================================================

set -e # Interrompe a execução imediatamente se qualquer comando falhar

echo "🚀 Iniciando Protocolo de Deploy em Produção — Conexão Freelance..."

# 1. Instalação de Dependências
echo "📦 Instalação de dependências do Backend..."
cd backend
npm ci
cd ..

# 2. Execução dos Testes de Integração
echo "🧪 Executando Testes de Integração Automatizados..."
cd backend
npm test || { echo "❌ Falha nos testes! Deploy abortado por segurança."; exit 1; }
cd ..

# 3. Build do Backend API
echo "⚙️ Compilando código fonte TypeScript do Backend..."
cd backend
npm run build
cd ..

# 4. Build da Aplicação Web
echo "🌐 Compilando aplicação Frontend Web..."
if [ -d "web" ]; then
  cd web
  npm ci
  npm run build
  cd ..
fi

# 5. Migração de Banco de Dados de Produção
if [ -n "$PRODUCTION_DATABASE_URL" ]; then
  echo "🗄️ Executando migração de banco de dados de produção..."
  psql "$PRODUCTION_DATABASE_URL" -f database/migrate_production.sql
fi

echo "✅ Protocolo de Deploy concluído com sucesso! Servidor pronto para produção."
