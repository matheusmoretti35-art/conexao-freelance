// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/routes/avaliacaoRoutes.ts
// DESCRIÇÃO: Rotas para Avaliações, Réplicas e Contatos (Etapa 3)
// ==============================================================================

import { Router } from 'express';
import { registrarContato, criarAvaliacao, publicarReplica, listarAvaliacoesPrestador } from '../controllers/avaliacaoController';

const router = Router();

router.post('/contatos', registrarContato);
router.post('/avaliacoes', criarAvaliacao);
router.post('/avaliacoes/replica', publicarReplica);
router.get('/avaliacoes/prestador/:id', listarAvaliacoesPrestador);

export default router;
