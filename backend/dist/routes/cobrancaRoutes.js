"use strict";
// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/routes/cobrancaRoutes.ts
// DESCRIÇÃO: Rotas para o Motor de Cobrança e Webhooks (Etapa 2)
// ==============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cobrancaController_1 = require("../controllers/cobrancaController");
const router = (0, express_1.Router)();
// Rota de geração de cobrança / chave PIX
router.post('/pagamentos/checkout', cobrancaController_1.gerarCheckout);
// Rota de recebimento assíncrono de Webhook do Gateway (Protegida por HMAC)
router.post('/webhooks/pagamentos', cobrancaController_1.receberWebhookPagamento);
// Rota de consulta de status para polling do aplicativo
router.get('/pagamentos/status', cobrancaController_1.verificarStatusPagamento);
exports.default = router;
