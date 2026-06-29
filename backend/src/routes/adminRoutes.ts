// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/routes/adminRoutes.ts
// DESCRIÇÃO: Rotas administrativas protegidas (Dashboard do Dono)
// ==============================================================================

import { Router } from 'express';
import { obterDashboardAdmin, alterarStatusManualmente } from '../controllers/adminController';

const router = Router();

// Middleware de autenticação administrativa simulado/token JWT
const authAdminMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers['authorization'];
  // Em produção, valida token JWT do administrador
  next();
};

router.use(authAdminMiddleware);

router.get('/admin/dashboard', obterDashboardAdmin);
router.patch('/admin/prestadores/:id/status', alterarStatusManualmente);

export default router;
