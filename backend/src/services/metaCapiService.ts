// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/services/metaCapiService.ts
// DESCRIÇÃO: Serviço de Disparo Server-Side via Meta Conversions API (CAPI) (Etapa 5)
// ==============================================================================

import crypto from 'crypto';

const META_PIXEL_ID = process.env.META_PIXEL_ID || '123456789012345';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAAG...';

interface IEventPayload {
  eventName: 'PageView' | 'Lead' | 'Purchase' | 'ContactClick';
  eventSourceUrl?: string;
  userData: {
    email?: string;
    phone?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
  };
  customData?: {
    currency?: string;
    value?: number;
  };
}

/**
 * Função para gerar Hash SHA-256 exigido pelo Meta Ads
 */
function hashSHA256(texto: string): string {
  return crypto.createHash('sha256').update(texto.trim().toLowerCase()).digest('hex');
}

/**
 * Envia evento Server-Side diretamente para a API do Meta
 */
export async function dispararEventoMeta(payload: IEventPayload): Promise<void> {
  try {
    const metaEventName = payload.eventName === 'ContactClick' ? 'Contact' : payload.eventName;

    const body = {
      data: [
        {
          event_name: metaEventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'app',
          event_source_url: payload.eventSourceUrl || 'https://conexaofreelance.com.br',
          user_data: {
            em: payload.userData.email ? [hashSHA256(payload.userData.email)] : undefined,
            ph: payload.userData.phone ? [hashSHA256(payload.userData.phone)] : undefined,
            client_ip_address: payload.userData.clientIpAddress,
            client_user_agent: payload.userData.clientUserAgent,
          },
          custom_data: payload.customData,
        },
      ],
    };

    // Chamada nativa com fetch global
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (response.ok) {
      console.log(`🎯 [CAPI Server-Side] Evento ${metaEventName} enviado com sucesso ao Meta!`);
    } else {
      const errData = await response.json();
      console.error('⚠️ Erro de resposta do Meta CAPI:', errData);
    }
  } catch (error) {
    console.error('❌ Falha ao enviar evento Server-Side para Meta:', error);
  }
}
