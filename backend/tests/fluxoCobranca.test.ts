// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: backend/tests/fluxoCobranca.test.ts
// DESCRIÇÃO: Teste de Integração Crítico Fim-a-Fim do Motor de Cobrança (R$ 29,90)
// ==============================================================================

import crypto from 'crypto';
import { pool } from '../src/db';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'chave_secreta_webhook_conexao_freelance_2026';

describe('🚀 Teste de Integração Crítico: Automação de Cobrança R$ 29,90', () => {
  let prestadorId: string;
  const mockWhatsapp = `(11) 9${Math.floor(10000000 + Math.random() * 90000000)}`;
  const mockTxId = `tx_test_${Date.now()}`;

  // Limpeza inicial e encerramento de conexões
  afterAll(async () => {
    if (prestadorId) {
      await pool.query('DELETE FROM prestadores WHERE id = $1', [prestadorId]);
    }
    await pool.end();
  });

  test('1. Deve criar um prestador com status inicial "pendente"', async () => {
    const response = await fetch(`${API_BASE_URL}/prestadores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_completo: 'Prestador Teste QA',
        whatsapp: mockWhatsapp,
        cidade: 'São Paulo',
        estado: 'SP',
        profissao: 'Eletricista',
      }),
    });

    const result = await response.json();
    expect(response.status).toBe(201);
    expect(result.sucesso).toBe(true);
    expect(result.dados.status).toBe('pendente');
    
    prestadorId = result.dados.id;
    expect(prestadorId).toBeDefined();
  });

  test('2. Prestador "pendente" NÃO deve aparecer nas buscas dos clientes', async () => {
    const response = await fetch(`${API_BASE_URL}/prestadores/busca?estado=SP&cidade=São%20Paulo&profissao=Eletricista`);
    const result = await response.json();
    
    expect(response.status).toBe(200);
    const encontrou = result.dados.some((p: any) => p.id === prestadorId);
    expect(encontrou).toBe(false); // Garantia de negócio
  });

  test('3. Deve registrar cobrança de R$ 29,90 e receber Webhook HMAC aprovado', async () => {
    // 3.1 Gera Checkout
    const checkoutRes = await fetch(`${API_BASE_URL}/pagamentos/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prestador_id: prestadorId, metodo_pagamento: 'pix' }),
    });
    const checkoutData = await checkoutRes.json();
    expect(checkoutRes.status).toBe(201);

    // 3.2 Prepara Payload e Assinatura HMAC SHA-256 do Webhook simulado
    const webhookPayload = {
      evento: 'PAYMENT_RECEIVED',
      transaction_id: checkoutData.dados.gateway_transaction_id,
      status: 'pago',
      valor: 29.90,
    };

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const signature = hmac.update(JSON.stringify(webhookPayload)).digest('hex');

    // 3.3 Dispara Webhook
    const webhookRes = await fetch(`${API_BASE_URL}/webhooks/pagamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
      },
      body: JSON.stringify(webhookPayload),
    });

    const webhookData = await webhookRes.json();
    expect(webhookRes.status).toBe(200);
    expect(webhookData.recebido).toBe(true);
  });

  test('4. Validação no Banco: Trigger deve ter alterado o status para "ativo"', async () => {
    // Aguarda 500ms para propagação do Trigger
    await new Promise((resolve) => setTimeout(resolve, 500));

    const dbRes = await pool.query('SELECT status FROM prestadores WHERE id = $1', [prestadorId]);
    expect(dbRes.rows[0].status).toBe('ativo');
  });

  test('5. Prestador agora "ativo" DEVE aparecer na busca filtrada', async () => {
    const response = await fetch(`${API_BASE_URL}/prestadores/busca?estado=SP&cidade=São%20Paulo&profissao=Eletricista`);
    const result = await response.json();
    
    expect(response.status).toBe(200);
    const encontrou = result.dados.some((p: any) => p.id === prestadorId);
    expect(encontrou).toBe(true);
  });

  test('6. Simulação de Cancelamento/Expiração: Status deve mudar para "inativo" e sumir das buscas', async () => {
    // 6.1 Atualiza transação para expirado
    const cancelPayload = {
      evento: 'PAYMENT_EXPIRED',
      transaction_id: mockTxId,
      status: 'expirado',
    };

    // Atualiza via banco para testar a trigger de inativação
    await pool.query(
      `INSERT INTO transacoes (assinatura_id, prestador_id, gateway_transaction_id, valor, metodo_pagamento, status)
       VALUES ((SELECT id FROM assinaturas WHERE prestador_id = $1 LIMIT 1), $1, $2, 29.90, 'pix', 'expirado');`,
      [prestadorId, mockTxId]
    );

    // 6.2 Valida no Banco
    const dbRes = await pool.query('SELECT status FROM prestadores WHERE id = $1', [prestadorId]);
    expect(dbRes.rows[0].status).toBe('inativo');

    // 6.3 Valida que sumiu da busca do aplicativo
    const buscaRes = await fetch(`${API_BASE_URL}/prestadores/busca?estado=SP&cidade=São%20Paulo&profissao=Eletricista`);
    const buscaData = await buscaRes.json();
    const encontrou = buscaData.dados.some((p: any) => p.id === prestadorId);
    expect(encontrou).toBe(false);
  });
});
