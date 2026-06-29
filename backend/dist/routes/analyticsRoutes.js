"use strict";
// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/routes/analyticsRoutes.ts
// DESCRIÇÃO: Rotas para Rastreamento de Funil e Pixels (Etapa 5)
// ==============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const router = (0, express_1.Router)();
router.post('/analytics/event', analyticsController_1.registrarEventoAnalytics);
exports.default = router;
