// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/db.ts
// DESCRIÇÃO: Conexão resiliente e gerenciamento de Pool do PostgreSQL
// ==============================================================================

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do Pool de Conexões com fallback seguro
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/conexao_freelance',
  max: 20, // Máximo de conexões concorrentes no pool
  idleTimeoutMillis: 30000, // Tempo limite de ociosidade
  connectionTimeoutMillis: 2000, // Tempo limite para estabelecer conexão
});

// Evento de verificação de conexão bem-sucedida
pool.on('connect', () => {
  console.log('⚡ Conexão estabelecida com o banco de dados PostgreSQL.');
});

// Evento de captura de erros inesperados em conexões inativas
pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool do PostgreSQL:', err);
});
