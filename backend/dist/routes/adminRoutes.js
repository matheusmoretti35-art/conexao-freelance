"use strict";
// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/routes/adminRoutes.ts
// DESCRIÇÃO: Rotas administrativas protegidas (Dashboard do Dono)
// ==============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// Middleware de autenticação administrativa simulado/token JWT
const authAdminMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    // Em produção, valida token JWT do administrador
    next();
};
router.use(authAdminMiddleware);
router.get('/admin/dashboard', adminController_1.obterDashboardAdmin);
router.patch('/admin/prestadores/:id/status', adminController_1.alterarStatusManualmente);
exports.default = router;
