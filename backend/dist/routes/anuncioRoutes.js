"use strict";
// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/routes/anuncioRoutes.ts
// DESCRIÇÃO: Rotas para a Engine de Publicidade Contextual (Etapa 4)
// ==============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const anuncioController_1 = require("../controllers/anuncioController");
const router = (0, express_1.Router)();
router.get('/anuncios/contextual', anuncioController_1.obterAnuncioContextual);
router.post('/anuncios/clique', anuncioController_1.registrarCliqueAnuncio);
exports.default = router;
