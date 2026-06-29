// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/controllers/analyticsController.ts
// DESCRIÇÃO: Controlador para recepção de eventos de funil e repasse ao CAPI (Etapa 5)
// ==============================================================================

import { Request, Response } from 'express';
import { dispararEventoMeta } from '../services/metaCapiService';

export const registrarEventoAnalytics = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { eventName, email, phone, customData } = req.body;

    if (!eventName) {
      return res.status(400).json({ sucesso: false, mensagem: 'eventName é obrigatório.' });
    }

    const clientIpAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const clientUserAgent = req.headers['user-agent'] || 'App Mobile Conexao Freelance';

    // Dispara em background para não travar o app do usuário
    dispararEventoMeta({
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
  } catch (error) {
    console.error('Erro no controller de analytics:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao processar evento.' });
  }
};
