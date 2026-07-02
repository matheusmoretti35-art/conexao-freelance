import { Platform } from 'react-native';
import * as TrackingTransparency from 'expo-tracking-transparency';

/**
 * Solicita permissão de ATT (App Tracking Transparency) no iOS de forma nativa.
 */
export const solicitarPermissaoATT = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') return true;
  
  try {
    const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Erro ao solicitar permissão ATT:', error);
    return false;
  }
};

export const useAnalyticsTracking = () => {
  /**
   * Envia evento de conversão para a API backend que repassa ao Meta/Google CAPI
   * Respeitando a política de ATT do iOS.
   */
  const rastrearEvento = async (
    eventName: 'PageView' | 'Lead' | 'Purchase' | 'ContactClick',
    dadosUsuario?: { email?: string; phone?: string },
    customData?: { currency?: string; value?: number; content_name?: string }
  ) => {
    // Valida permissão ATT antes de disparar no iOS
    const permitido = await solicitarPermissaoATT();
    if (!permitido) {
      console.log(`🚫 [ATT Negado] Evento ${eventName} não enviado por restrição de privacidade.`);
      return;
    }

    try {
      // Disparo Server-Side via CAPI do Railway (Totalmente seguro e independente de SDKs nativos pesados)
      await fetch('https://conexao-freelance-production.up.railway.app/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          email: dadosUsuario?.email,
          phone: dadosUsuario?.phone,
          customData,
        }),
      });
      console.log(`🎯 [useAnalyticsTracking] Evento ${eventName} disparado com sucesso via API CAPI.`);
    } catch (error) {
      // Silencia erros para não interferir na experiência do usuário final
    }
  };

  return { rastrearEvento };
};
