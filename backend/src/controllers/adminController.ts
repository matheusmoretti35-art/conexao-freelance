// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/controllers/adminController.ts
// DESCRIÇÃO: Controlador do Painel do Administrador (Dashboard do Dono)
// ==============================================================================

import { Request, Response } from 'express';
import { pool } from '../db';

/**
 * 1. OBTÊR MÉTRICAS E DADOS DO DASHBOARD ADMINISTRATIVO
 * Endpoint: GET /api/admin/dashboard
 */
export const obterDashboardAdmin = async (req: Request, res: Response): Promise<Response> => {
  try {
    // 1. Consulta Agrupada de Métricas Gerais (COUNT por status e Soma de Faturamento)
    const metricasQuery = `
      SELECT 
        COUNT(*) AS total_geral,
        COUNT(*) FILTER (WHERE status = 'ativo') AS total_ativos,
        COUNT(*) FILTER (WHERE status = 'pendente') AS total_pendentes,
        COUNT(*) FILTER (WHERE status = 'inativo' OR status = 'suspenso') AS total_inativos
      FROM prestadores;
    `;
    const metricasRes = await pool.query(metricasQuery);
    const m = metricasRes.rows[0];

    const totalAtivos = parseInt(m.total_ativos, 10) || 0;
    const faturamentoEstimado = totalAtivos * 29.90;

    // 2. Tabela de Gestão de Prestadores (Últimos cadastrados)
    const prestadoresQuery = `
      SELECT id, nome_completo, whatsapp, cidade, estado, profissao, status, criado_em
      FROM prestadores
      ORDER BY criado_em DESC
      LIMIT 100;
    `;
    const prestadoresRes = await pool.query(prestadoresQuery);

    // 3. Histórico de Últimos Pagamentos / Logs de Webhook
    const pagamentosQuery = `
      SELECT 
        t.id,
        p.nome_completo AS prestador_nome,
        t.metodo_pagamento,
        t.valor,
        t.status,
        t.criado_em AS data_hora
      FROM transacoes t
      JOIN prestadores p ON p.id = t.prestador_id
      ORDER BY t.criado_em DESC
      LIMIT 20;
    `;
    const pagamentosRes = await pool.query(pagamentosQuery);

    return res.status(200).json({
      sucesso: true,
      metricas: {
        total_geral: parseInt(m.total_geral, 10) || 0,
        total_ativos: totalAtivos,
        total_pendentes: parseInt(m.total_pendentes, 10) || 0,
        total_inativos: parseInt(m.total_inativos, 10) || 0,
        faturamento_estimado_mensal: parseFloat(faturamentoEstimado.toFixed(2)),
      },
      prestadores: prestadoresRes.rows,
      historico_pagamentos: pagamentosRes.rows,
    });
  } catch (error) {
    console.error('Erro ao gerar dados do dashboard admin:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao carregar dashboard administrativo.' });
  }
};

/**
 * 2. AÇÃO ADMINISTRATIVA: ALTERAR STATUS MANUALMENTE (Ativar/Bloquear Cortesia)
 * Endpoint: PATCH /api/admin/prestadores/:id/status
 */
export const alterarStatusManualmente = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { novo_status } = req.body;

    if (!['ativo', 'inativo', 'pendente', 'suspenso'].includes(novo_status)) {
      return res.status(400).json({ sucesso: false, mensagem: 'Status informado é inválido.' });
    }

    const updateRes = await pool.query(
      `UPDATE prestadores SET status = $1, atualizado_em = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, nome_completo, status;`,
      [novo_status, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Prestador não encontrado.' });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: `Status do prestador ${updateRes.rows[0].nome_completo} alterado com sucesso para '${novo_status}'.`,
      dados: updateRes.rows[0],
    });
  } catch (error) {
    console.error('Erro ao alterar status manualmente:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao executar ação administrativa.' });
  }
};
