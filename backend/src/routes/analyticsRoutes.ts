// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/routes/analyticsRoutes.ts
// DESCRIÇÃO: Rotas para Rastreamento de Funil e Pixels (Etapa 5)
// ==============================================================================

import { Router } from 'express';
import { registrarEventoAnalytics } from '../controllers/analyticsController';

const router = Router();

router.post('/analytics/event', registrarEventoAnalytics);

export default router;
