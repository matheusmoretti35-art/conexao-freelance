"use strict";
// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/routes/avaliacaoRoutes.ts
// DESCRIÇÃO: Rotas para Avaliações, Réplicas e Contatos (Etapa 3)
// ==============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const avaliacaoController_1 = require("../controllers/avaliacaoController");
const router = (0, express_1.Router)();
router.post('/contatos', avaliacaoController_1.registrarContato);
router.post('/avaliacoes', avaliacaoController_1.criarAvaliacao);
router.post('/avaliacoes/replica', avaliacaoController_1.publicarReplica);
router.get('/avaliacoes/prestador/:id', avaliacaoController_1.listarAvaliacoesPrestador);
exports.default = router;
