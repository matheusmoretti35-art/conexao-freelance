"use strict";
// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/controllers/analyticsController.ts
// DESCRIÇÃO: Controlador para recepção de eventos de funil e repasse ao CAPI (Etapa 5)
// ==============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarEventoAnalytics = void 0;
const metaCapiService_1 = require("../services/metaCapiService");
const registrarEventoAnalytics = async (req, res) => {
    try {
        const { eventName, email, phone, customData } = req.body;
        if (!eventName) {
            return res.status(400).json({ sucesso: false, mensagem: 'eventName é obrigatório.' });
        }
        const clientIpAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const clientUserAgent = req.headers['user-agent'] || 'App Mobile Conexao Freelance';
        // Dispara em background para não travar o app do usuário
        (0, metaCapiService_1.dispararEventoMeta)({
            eventName,
            userData: {
                email,
                phone,
                clientIpAddress: clientIpAddress.split(',')[0],
                clientUserAgent,
            },
            customData,
        });
        return res.status(200).json({ sucesso: true, mensagem: 'Evento de analytics enfileirado.' });
    }
    catch (error) {
        console.error('Erro no controller de analytics:', error);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao processar evento.' });
    }
};
exports.registrarEventoAnalytics = registrarEventoAnalytics;
