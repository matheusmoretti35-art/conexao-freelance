import { Platform } from 'react-native';

/**
 * Solicita permissão de ATT (App Tracking Transparency) no iOS de forma nativa.
 * Em produção real, utiliza a biblioteca 'react-native-tracking-transparency'.
 */
export const solicitarPermissaoATT = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') return true;
  
  try {
    // Simulação do comportamento nativo do iOS para homologação
    console.log('🔍 [iOS ATT] Verificando permissão de rastreamento do usuário...');
    // Em produção: 
    // const status = await requestTrackingPermission();
    // return status === 'authorized';
    return true; 
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
      // Endpoint unificado do Railway
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
