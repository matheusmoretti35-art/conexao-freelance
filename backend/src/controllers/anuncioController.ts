// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/controllers/anuncioController.ts
// DESCRIÇÃO: Controladores de AdServer Contextual e Métricas de Clique (Etapa 4)
// ==============================================================================

import { Request, Response } from 'express';
import { pool } from '../db';

/**
 * 1. ROTA DE CONSULTA DE BANNER CONTEXTUAL
 * Endpoint: GET /api/anuncios/contextual
 */
export const obterAnuncioContextual = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { estado, cidade, profissao } = req.query;

    if (!estado || !cidade || !profissao) {
      return res.status(400).json({ sucesso: false, mensagem: 'estado, cidade e profissao são obrigatórios.' });
    }

    const queryText = `
      SELECT id, titulo, imagem_banner_url, link_destino
      FROM anuncios_patrocinados
      WHERE ativo = true
        AND UPPER(estado) = UPPER($1)
        AND LOWER(cidade) = LOWER($2)
        AND LOWER(profissao) = LOWER($3)
        AND CURRENT_TIMESTAMP BETWEEN data_inicio AND data_fim;
    `;

    const result = await pool.query(queryText, [
      (estado as string).trim(),
      (cidade as string).trim(),
      (profissao as string).trim(),
    ]);

    if (result.rows.length === 0) {
      return res.status(200).json({ sucesso: true, anuncio: null });
    }

    // Algoritmo de Seleção Aleatória (AdServer)
    const anuncioEscolhido = result.rows[Math.floor(Math.random() * result.rows.length)];

    // Registra métrica de impressão de forma assíncrona
    pool.query(`INSERT INTO metricas_anuncios (anuncio_id, tipo_evento) VALUES ($1, 'impressao');`, [anuncioEscolhido.id]);

    return res.status(200).json({ sucesso: true, anuncio: anuncioEscolhido });
  } catch (error) {
    console.error('Erro ao buscar anúncio contextual:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao carregar anúncio.' });
  }
};

/**
 * 2. ROTA DE REGISTRO DE CLIQUE NO ANÚNCIO
 * Endpoint: POST /api/anuncios/clique
 */
export const registrarCliqueAnuncio = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { anuncio_id } = req.body;
    if (!anuncio_id) {
      return res.status(400).json({ sucesso: false, mensagem: 'anuncio_id é obrigatório.' });
    }

    await pool.query(`INSERT INTO metricas_anuncios (anuncio_id, tipo_evento) VALUES ($1, 'clique');`, [anuncio_id]);
    return res.status(200).json({ sucesso: true, mensagem: 'Clique registrado.' });
  } catch (error) {
    console.error('Erro ao registrar clique:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao registrar clique.' });
  }
};
