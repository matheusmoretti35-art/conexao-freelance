// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/routes/cobrancaRoutes.ts
// DESCRIÇÃO: Rotas para o Motor de Cobrança e Webhooks (Etapa 2)
// ==============================================================================

import { Router } from 'express';
import { gerarCheckout, receberWebhookPagamento, verificarStatusPagamento } from '../controllers/cobrancaController';

const router = Router();

// Rota de geração de cobrança / chave PIX
router.post('/pagamentos/checkout', gerarCheckout);

// Rota de recebimento assíncrono de Webhook do Gateway (Protegida por HMAC)
router.post('/webhooks/pagamentos', receberWebhookPagamento);

// Rota de consulta de status para polling do aplicativo
router.get('/pagamentos/status', verificarStatusPagamento);

export default router;
