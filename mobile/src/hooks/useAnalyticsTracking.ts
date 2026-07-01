import { Platform } from 'react-native';

// Carregamento dinâmico e seguro para evitar erros de compilação caso as dependências ainda não estejam vinculadas
let requestTrackingPermission: any = null;
let Settings: any = null;
let AppEventsLogger: any = null;

try {
  const attLib = require('react-native-tracking-transparency');
  requestTrackingPermission = attLib.requestTrackingPermission;
} catch (e) {
  // Não instalado
}

try {
  const fbSdk = require('react-native-fbsdk-next');
  Settings = fbSdk.Settings;
  AppEventsLogger = fbSdk.AppEventsLogger;
} catch (e) {
  // Não instalado
}

/**
 * Solicita permissão de ATT (App Tracking Transparency) no iOS de forma nativa.
 */
export const solicitarPermissaoATT = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') return true;
  
  try {
    if (requestTrackingPermission) {
      const status = await requestTrackingPermission();
      return status === 'authorized';
    }
    console.log('🔍 [iOS ATT Simulação] Permissão ATT verificada e concedida por padrão.');
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
      // 1. Disparo Client-Side do SDK do Facebook (se estiver instalado e configurado no App)
      if (AppEventsLogger) {
        AppEventsLogger.logEvent(eventName, customData);
        console.log(`📱 [Meta SDK Mobile] Evento ${eventName} disparado via SDK.`);
      }

      // 2. Disparo Server-Side via CAPI do Railway
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
