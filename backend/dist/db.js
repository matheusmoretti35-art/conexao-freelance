"use strict";
// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/db.ts
// DESCRIÇÃO: Conexão resiliente e gerenciamento de Pool do PostgreSQL
// ==============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configuração do Pool de Conexões com fallback seguro
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/conexao_freelance',
    max: 20, // Máximo de conexões concorrentes no pool
    idleTimeoutMillis: 30000, // Tempo limite de ociosidade
    connectionTimeoutMillis: 2000, // Tempo limite para estabelecer conexão
});
// Evento de verificação de conexão bem-sucedida
exports.pool.on('connect', () => {
    console.log('⚡ Conexão estabelecida com o banco de dados PostgreSQL.');
});
// Evento de captura de erros inesperados em conexões inativas
exports.pool.on('error', (err) => {
    console.error('❌ Erro inesperado no pool do PostgreSQL:', err);
});
