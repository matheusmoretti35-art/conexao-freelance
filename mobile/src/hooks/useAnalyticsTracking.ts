// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/hooks/useAnalyticsTracking.ts
// DESCRIÇÃO: Hook React Native para Disparo de Eventos de Funil (Etapa 5)
// ==============================================================================

export const useAnalyticsTracking = () => {
  /**
   * Envia evento de conversão para a API backend que repassa ao Meta/Google CAPI
   */
  const rastrearEvento = async (
    eventName: 'PageView' | 'Lead' | 'Purchase' | 'ContactClick',
    dadosUsuario?: { email?: string; phone?: string },
    customData?: { currency?: string; value?: number }
  ) => {
    try {
      await fetch('http://localhost:3000/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          email: dadosUsuario?.email,
          phone: dadosUsuario?.phone,
          customData,
        }),
      });
    } catch (error) {
      // Ignora falha para não travar navegação do app
    }
  };

  return { rastrearEvento };
};
