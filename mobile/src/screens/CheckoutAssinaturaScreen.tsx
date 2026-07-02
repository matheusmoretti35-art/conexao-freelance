// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/screens/CheckoutAssinaturaScreen.tsx
// DESCRIÇÃO: Tela Mobile de Checkout PIX com Cópia de Código e Polling em Tempo Real (Etapa 2)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Clipboard,
  SafeAreaView,
} from 'react-native';
import { useAnalyticsTracking } from '../hooks/useAnalyticsTracking';

interface ICheckoutProps {
  prestadorId: string;
  onPagamentoConfirmado: () => void;
}

export const CheckoutAssinaturaScreen: React.FC<ICheckoutProps> = ({ prestadorId, onPagamentoConfirmado }) => {
  const { rastrearEvento } = useAnalyticsTracking();
  const [carregando, setCarregando] = useState<boolean>(true);
  const [pixCode, setPixCode] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [copiado, setCopiado] = useState<boolean>(false);

  // 1. Gera a cobrança assim que a tela abre
  useEffect(() => {
    gerarCobranca();
  }, []);

  // 2. Polling inteligente: Checa confirmação do banco a cada 4 segundos
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (transactionId) {
      interval = setInterval(() => {
        checarStatus();
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [transactionId]);

  const gerarCobranca = async () => {
    setCarregando(true);
    try {
      const response = await fetch('https://conexao-freelance-production.up.railway.app/api/pagamentos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prestador_id: prestadorId, metodo_pagamento: 'pix' }),
      });
      const result = await response.json();

      if (response.ok && result.sucesso) {
        setPixCode(result.dados.pix_copia_cola);
        setTransactionId(result.dados.gateway_transaction_id);
      } else {
        Alert.alert('Erro', result.mensagem || 'Falha ao gerar chave PIX.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor de pagamentos.');
    } finally {
      setCarregando(false);
    }
  };

  const checarStatus = async () => {
    try {
      const response = await fetch(`https://conexao-freelance-production.up.railway.app/api/pagamentos/status?tx=${transactionId}`);
      const result = await response.json();

      if (result.sucesso && result.status === 'pago') {
        // Dispara evento Purchase
        rastrearEvento('Purchase', {}, { value: 29.90, currency: 'BRL', content_name: 'Plano Mensal Autônomo' });

        Alert.alert('🎉 Pagamento Aprovado!', 'Seu perfil profissional foi ativado com sucesso. Clientes já podem te encontrar!', [
          { text: 'Ir para Meu Perfil', onPress: onPagamentoConfirmado },
        ]);
      }
    } catch (e) {
      // Ignora falhas temporárias de rede durante polling
    }
  };

  const copiarChavePix = () => {
    Clipboard.setString(pixCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Gerando sua chave PIX com segurança...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badge}><Text style={styles.badgeText}>PLANO MENSAL RECORRENTE</Text></View>
        <Text style={styles.title}>Ativação de Perfil Profissional</Text>
        <Text style={styles.price}>R$ 29,90 <Text style={styles.period}>/mês</Text></Text>
        
        <Text style={styles.description}>
          Copie a chave PIX abaixo, abra o aplicativo do seu banco e faça o pagamento. A liberação do perfil é instantânea!
        </Text>

        <View style={styles.pixBox}>
          <Text numberOfLines={2} style={styles.pixText}>{pixCode}</Text>
        </View>

        <TouchableOpacity style={[styles.button, copiado ? styles.buttonCopied : null]} onPress={copiarChavePix}>
          <Text style={styles.buttonText}>{copiado ? '✓ Código PIX Copiado!' : '📋 Copiar Código PIX'}</Text>
        </TouchableOpacity>

        <View style={styles.statusFooter}>
          <ActivityIndicator size="small" color="#059669" />
          <Text style={styles.statusText}>Aguardando confirmação em tempo real...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontSize: 14 },
  card: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 20, elevation: 4 },
  badge: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 12 },
  badgeText: { color: '#2563EB', fontWeight: 'bold', fontSize: 11 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  price: { fontSize: 32, fontWeight: '900', color: '#059669', marginBottom: 12 },
  period: { fontSize: 14, fontWeight: 'normal', color: '#64748B' },
  description: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 16 },
  pixBox: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', marginBottom: 16 },
  pixText: { fontFamily: 'Courier', fontSize: 12, color: '#334155' },
  button: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
  buttonCopied: { backgroundColor: '#059669' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  statusFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  statusText: { marginLeft: 8, color: '#059669', fontSize: 12, fontWeight: '600' },
});
