"use strict";
// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/routes/prestadorRoutes.ts
// DESCRIÇÃO: Definição de rotas Express para prestadores de serviços (Etapa 1)
// ==============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prestadorController_1 = require("../controllers/prestadorController");
const router = (0, express_1.Router)();
// Rota para cadastro de novos prestadores (Status inicial: pendente)
router.post('/prestadores', prestadorController_1.cadastrarPrestador);
// Rota para busca de prestadores por cidade, estado e profissão (Status estrito: ativo)
router.get('/prestadores/busca', prestadorController_1.buscarPrestadores);
exports.default = router;
