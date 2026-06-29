// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/routes/prestadorRoutes.ts
// DESCRIÇÃO: Definição de rotas Express para prestadores de serviços (Etapa 1)
// ==============================================================================

import { Router } from 'express';
import { cadastrarPrestador, buscarPrestadores } from '../controllers/prestadorController';

const router = Router();

// Rota para cadastro de novos prestadores (Status inicial: pendente)
router.post('/prestadores', cadastrarPrestador);

// Rota para busca de prestadores por cidade, estado e profissão (Status estrito: ativo)
router.get('/prestadores/busca', buscarPrestadores);

export default router;
