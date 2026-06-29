// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/controllers/avaliacaoController.ts
// DESCRIÇÃO: Controladores de Avaliações, Réplicas e Registro de Contato (Etapa 3)
// ==============================================================================

import { Request, Response } from 'express';
import { pool } from '../db';

/**
 * 1. ROTA DE REGISTRO DE CONTATO (Chamada quando o cliente clica para abrir WhatsApp)
 * Endpoint: POST /api/contatos
 */
export const registrarContato = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { prestador_id, cliente_whatsapp, cliente_nome } = req.body;

    if (!prestador_id || !cliente_whatsapp) {
      return res.status(400).json({ sucesso: false, mensagem: 'prestador_id e cliente_whatsapp são obrigatórios.' });
    }

    await pool.query(
      `INSERT INTO contatos_clientes (prestador_id, cliente_whatsapp, cliente_nome) VALUES ($1, $2, $3);`,
      [prestador_id, cliente_whatsapp.trim(), cliente_nome ? cliente_nome.trim() : null]
    );

    return res.status(201).json({ sucesso: true, mensagem: 'Contato registrado com sucesso.' });
  } catch (error) {
    console.error('Erro ao registrar contato:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao registrar contato.' });
  }
};

/**
 * 2. ROTA DE CRIAR AVALIAÇÃO (Valida se o cliente contatou o prestador)
 * Endpoint: POST /api/avaliacoes
 */
export const criarAvaliacao = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { prestador_id, cliente_nome, cliente_whatsapp, nota, comentario } = req.body;

    if (!prestador_id || !cliente_nome || !cliente_whatsapp || !nota || !comentario) {
      return res.status(400).json({ sucesso: false, mensagem: 'Todos os campos são obrigatórios.' });
    }

    if (nota < 1 || nota > 5) {
      return res.status(400).json({ sucesso: false, mensagem: 'A nota deve ser entre 1 e 5.' });
    }

    // Trava Antispam: Checa se o cliente iniciou contato previamente
    const contatoCheck = await pool.query(
      `SELECT id FROM contatos_clientes WHERE prestador_id = $1 AND cliente_whatsapp = $2`,
      [prestador_id, cliente_whatsapp.trim()]
    );

    if (contatoCheck.rows.length === 0) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Apenas clientes que contataram o prestador através da plataforma podem enviar uma avaliação.',
      });
    }

    const insertRes = await pool.query(
      `INSERT INTO avaliacoes (prestador_id, cliente_nome, cliente_whatsapp, nota, comentario)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, criado_em;`,
      [prestador_id, cliente_nome.trim(), cliente_whatsapp.trim(), nota, comentario.trim()]
    );

    return res.status(201).json({ sucesso: true, mensagem: 'Avaliação registrada com sucesso.', dados: insertRes.rows[0] });
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao registrar avaliação.' });
  }
};

/**
 * 3. ROTA DE PUBLICAR RÉPLICA (Contra-argumento do Prestador)
 * Endpoint: POST /api/avaliacoes/replica
 */
export const publicarReplica = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { avaliacao_id, prestador_id, resposta } = req.body;

    if (!avaliacao_id || !prestador_id || !resposta || !resposta.trim()) {
      return res.status(400).json({ sucesso: false, mensagem: 'Parâmetros obrigatórios ausentes.' });
    }

    // Valida se a avaliação pertence ao prestador
    const avCheck = await pool.query(`SELECT id FROM avaliacoes WHERE id = $1 AND prestador_id = $2`, [avaliacao_id, prestador_id]);
    if (avCheck.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Avaliação não encontrada ou não pertence a este prestador.' });
    }

    const insertRes = await pool.query(
      `INSERT INTO replicas_prestadores (avaliacao_id, prestador_id, resposta) VALUES ($1, $2, $3) RETURNING id, criado_em;`,
      [avaliacao_id, prestador_id, resposta.trim()]
    );

    return res.status(201).json({ sucesso: true, mensagem: 'Réplica publicada com sucesso.', dados: insertRes.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ sucesso: false, mensagem: 'Você já respondeu a esta avaliação.' });
    }
    console.error('Erro ao publicar réplica:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao publicar resposta.' });
  }
};

/**
 * 4. ROTA DE CONSULTAR AVALIAÇÕES DE UM PRESTADOR
 * Endpoint: GET /api/avaliacoes/prestador/:id
 */
export const listarAvaliacoesPrestador = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const queryText = `
      SELECT 
        a.id, a.cliente_nome, a.nota, a.comentario, a.criado_em,
        r.resposta AS replica_resposta, r.criado_em AS replica_criado_em
      FROM avaliacoes a
      LEFT JOIN replicas_prestadores r ON r.avaliacao_id = a.id
      WHERE a.prestador_id = $1 AND a.status_moderacao = 'aprovado'
      ORDER BY a.criado_em DESC;
    `;

    const result = await pool.query(queryText, [id]);
    return res.status(200).json({ sucesso: true, dados: result.rows });
  } catch (error) {
    console.error('Erro ao listar avaliações:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao consultar avaliações.' });
  }
};
