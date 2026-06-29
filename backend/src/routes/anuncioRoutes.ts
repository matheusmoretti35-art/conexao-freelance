// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/routes/anuncioRoutes.ts
// DESCRIÇÃO: Rotas para a Engine de Publicidade Contextual (Etapa 4)
// ==============================================================================

import { Router } from 'express';
import { obterAnuncioContextual, registrarCliqueAnuncio } from '../controllers/anuncioController';

const router = Router();

router.get('/anuncios/contextual', obterAnuncioContextual);
router.post('/anuncios/clique', registrarCliqueAnuncio);

export default router;
