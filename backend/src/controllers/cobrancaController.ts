// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/controllers/cobrancaController.ts
// DESCRIÇÃO: Controladores de Checkout, Webhook com HMAC e Polling de Status (Etapa 2)
// ==============================================================================

import { Request, Response } from 'express';
import crypto from 'crypto';
import { pool } from '../db';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'chave_secreta_webhook_conexao_freelance_2026';

/**
 * 1. ROTA DE GERAÇÃO DE CHECKOUT PIX (R$ 29,90)
 * Endpoint: POST /api/pagamentos/checkout
 */
export const gerarCheckout = async (req: Request, res: Response): Promise<Response> => {
  const client = await pool.connect();
  try {
    const { prestador_id, metodo_pagamento = 'pix' } = req.body;

    if (!prestador_id) {
      return res.status(400).json({ sucesso: false, mensagem: 'O prestador_id é obrigatório.' });
    }

    // Verifica existência do prestador
    const prestadorRes = await client.query('SELECT id FROM prestadores WHERE id = $1', [prestador_id]);
    if (prestadorRes.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Prestador não encontrado.' });
    }

    // Gera IDs randômicos e Payload PIX simulado do Gateway
    const mockTxId = `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const mockPixPayload = `00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540529.905802BR5925CONEXAO FREELANCE LTDA6009SAO PAULO6304E2CA`;

    const dataProxima = new Date();
    dataProxima.setMonth(dataProxima.getMonth() + 1);

    await client.query('BEGIN');

    // 1. Registra Assinatura
    const assRes = await client.query(
      `INSERT INTO assinaturas (prestador_id, gateway_subscription_id, valor, metodo_pagamento, status, data_proxima_cobranca)
       VALUES ($1, $2, 29.90, $3, 'aguardando_pagamento', $4) RETURNING id;`,
      [prestador_id, `sub_${mockTxId}`, metodo_pagamento, dataProxima]
    );

    // 2. Registra Transação / Fatura
    const txRes = await client.query(
      `INSERT INTO transacoes (assinatura_id, prestador_id, gateway_transaction_id, valor, metodo_pagamento, status, pix_copia_cola)
       VALUES ($1, $2, $3, 29.90, $4, 'aguardando_pagamento', $5)
       RETURNING id, gateway_transaction_id, pix_copia_cola, status;`,
      [assRes.rows[0].id, prestador_id, mockTxId, metodo_pagamento, mockPixPayload]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Cobrança gerada com sucesso. Aguardando pagamento.',
      dados: txRes.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao gerar checkout:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Falha ao gerar cobrança de assinatura.' });
  } finally {
    client.release();
  }
};

/**
 * 2. RECEPTOR DE WEBHOOK ASSÍNCRONO COM VALIDAÇÃO HMAC SHA-256
 * Endpoint: POST /api/webhooks/pagamentos
 */
export const receberWebhookPagamento = async (req: Request, res: Response): Promise<Response> => {
  try {
    const signature = req.headers['x-signature'] as string;
    if (!signature) {
      return res.status(401).json({ sucesso: false, mensagem: 'Assinatura de segurança ausente no cabeçalho.' });
    }

    // Validação da assinatura criptográfica do Gateway
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = hmac.update(JSON.stringify(req.body)).digest('hex');

    if (signature !== digest) {
      console.warn('⚠️ Alerta de Segurança: Tentativa de Webhook falsificado detectada!');
      return res.status(403).json({ sucesso: false, mensagem: 'Assinatura HMAC inválida.' });
    }

    const { evento, transaction_id, status } = req.body;

    if (evento === 'PAYMENT_RECEIVED' || status === 'pago') {
      // Ao atualizar o status da transação para 'pago', o Trigger do Postgres ativa o perfil na hora!
      await pool.query(
        `UPDATE transacoes SET status = 'pago', data_pagamento = CURRENT_TIMESTAMP WHERE gateway_transaction_id = $1;`,
        [transaction_id]
      );
      console.log(`✅ Pagamento confirmado para transação ${transaction_id}. Prestador ativado via Trigger.`);
    }

    return res.status(200).json({ recebido: true });
  } catch (error) {
    console.error('Erro ao processar Webhook:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao processar Webhook.' });
  }
};

/**
 * 3. ROTA DE POLLING DE STATUS DA TRANSAÇÃO
 * Endpoint: GET /api/pagamentos/status
 */
export const verificarStatusPagamento = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { tx } = req.query;
    if (!tx) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID de transação (tx) obrigatório.' });
    }

    const result = await pool.query('SELECT status, data_pagamento FROM transacoes WHERE gateway_transaction_id = $1', [tx]);
    if (result.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Transação não encontrada.' });
    }

    return res.status(200).json({
      sucesso: true,
      status: result.rows[0].status,
      data_pagamento: result.rows[0].data_pagamento,
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao consultar status do pagamento.' });
  }
};
