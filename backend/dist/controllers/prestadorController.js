"use strict";
// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/controllers/prestadorController.ts
// DESCRIÇÃO: Controladores para operações com prestadores de serviços (Etapa 1)
// ==============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarPrestadores = exports.cadastrarPrestador = void 0;
const db_1 = require("../db");
/**
 * 1. ROTA DE INSERÇÃO/CADASTRO DE PRESTADOR
 * Endpoint: POST /api/prestadores
 * Descrição: Recebe os dados cadastrais e salva o perfil com status 'pendente'
 */
const cadastrarPrestador = async (req, res) => {
    try {
        const { nome_completo, whatsapp, cidade, estado, profissao } = req.body;
        // Validação de presença dos campos obrigatórios no backend
        if (!nome_completo || !whatsapp || !cidade || !estado || !profissao) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Erro de validação: Todos os campos (nome_completo, whatsapp, cidade, estado, profissao) são obrigatórios.',
            });
        }
        // Validação do formato do estado (UF com 2 letras)
        if (estado.trim().length !== 2) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Erro de validação: O estado (UF) deve conter exatamente 2 letras.',
            });
        }
        // Query SQL parametrizada para inserção segura (Proteção total contra SQL Injection)
        // Insere o profissional forçando rigidamente o status inicial como 'pendente'
        const queryText = `
      INSERT INTO prestadores (nome_completo, whatsapp, cidade, estado, profissao, status)
      VALUES ($1, $2, $3, UPPER($4), $5, 'pendente')
      RETURNING id, nome_completo, whatsapp, cidade, estado, profissao, status, criado_em;
    `;
        const values = [
            nome_completo.trim(),
            whatsapp.trim(),
            cidade.trim(),
            estado.trim(),
            profissao.trim(),
        ];
        const result = await db_1.pool.query(queryText, values);
        const novoPrestador = result.rows[0];
        return res.status(201).json({
            sucesso: true,
            mensagem: 'Cadastro realizado com sucesso! Seu perfil está pendente de ativação.',
            dados: novoPrestador,
        });
    }
    catch (error) {
        console.error('Erro ao cadastrar prestador:', error);
        // Tratamento de erro para violação de chave única (WhatsApp já cadastrado)
        if (error.code === '23505') {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Este número de WhatsApp já está cadastrado no sistema.',
            });
        }
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Falha interna do servidor ao processar o cadastro.',
        });
    }
};
exports.cadastrarPrestador = cadastrarPrestador;
/**
 * 2. ROTA DE BUSCA FILTRADA DE PRESTADORES ATIVOS
 * Endpoint: GET /api/prestadores/busca
 * Descrição: Realiza a consulta indexada por cidade, estado e profissão
 * Regra Crítica: Retorna estritamente profissionais com status = 'ativo'
 */
const buscarPrestadores = async (req, res) => {
    try {
        const { cidade, estado, profissao, pagina = '1', limite = '20' } = req.query;
        // Validação dos parâmetros de busca obrigatórios
        if (!cidade || !estado || !profissao) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Filtros obrigatórios ausentes. Informe cidade, estado e profissao para realizar a busca.',
            });
        }
        // Paginação para evitar sobrecarga de memória
        const pageNum = Math.max(1, parseInt(pagina, 10));
        const limitNum = Math.min(50, Math.max(1, parseInt(limite, 10)));
        const offsetNum = (pageNum - 1) * limitNum;
        // Query SQL parametrizada que utiliza o índice parcial 'idx_prestadores_busca_ativa'
        // REGRA CRÍTICA: O filtro 'status = 'ativo'' garante que perfis pendentes ou inativos nunca apareçam nas buscas
        const queryText = `
      SELECT 
        id, 
        nome_completo, 
        whatsapp, 
        cidade, 
        estado, 
        profissao, 
        criado_em
      FROM prestadores
      WHERE status = 'ativo'
        AND UPPER(estado) = UPPER($1)
        AND LOWER(cidade) = LOWER($2)
        AND LOWER(profissao) = LOWER($3)
      ORDER BY criado_em DESC
      LIMIT $4 OFFSET $5;
    `;
        const values = [
            estado.trim(),
            cidade.trim(),
            profissao.trim(),
            limitNum,
            offsetNum,
        ];
        const result = await db_1.pool.query(queryText, values);
        return res.status(200).json({
            sucesso: true,
            pagina: pageNum,
            limite: limitNum,
            total_retornados: result.rows.length,
            dados: result.rows,
        });
    }
    catch (error) {
        console.error('Erro ao buscar prestadores:', error);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Falha interna do servidor ao executar a busca de prestadores.',
        });
    }
};
exports.buscarPrestadores = buscarPrestadores;
