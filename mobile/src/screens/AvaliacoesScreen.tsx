// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/screens/AvaliacoesScreen.tsx
// DESCRIÇÃO: Tela Mobile de Exibição e Resposta de Avaliações (Etapa 3)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

interface IAvaliacao {
  id: string;
  cliente_nome: string;
  nota: number;
  comentario: string;
  criado_em: string;
  replica_resposta?: string;
}

export const AvaliacoesScreen: React.FC<{ prestadorId: string; eDonoDoPerfil: boolean }> = ({ prestadorId, eDonoDoPerfil }) => {
  const [avaliacoes, setAvaliacoes] = useState<IAvaliacao[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [respostas, setRespostas] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    carregarAvaliacoes();
  }, [prestadorId]);

  const carregarAvaliacoes = async () => {
    try {
      const res = await fetch(`https://conexao-freelance-production.up.railway.app/api/avaliacoes/prestador/${prestadorId}`);
      const data = await res.json();
      if (res.ok && data.sucesso) {
        setAvaliacoes(data.dados);
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar as avaliações.');
    } finally {
      setCarregando(false);
    }
  };

  const enviarReplica = async (avaliacaoId: string) => {
    const texto = respostas[avaliacaoId];
    if (!texto || !texto.trim()) {
      return Alert.alert('Atenção', 'Escreva sua resposta antes de enviar.');
    }

    try {
      const res = await fetch('https://conexao-freelance-production.up.railway.app/api/avaliacoes/replica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avaliacao_id: avaliacaoId, prestador_id: prestadorId, resposta: texto }),
      });
      const data = await res.json();

      if (res.ok && data.sucesso) {
        Alert.alert('Sucesso', 'Sua réplica foi publicada!');
        carregarAvaliacoes();
      } else {
        Alert.alert('Erro', data.mensagem || 'Falha ao publicar réplica.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao conectar com o servidor.');
    }
  };

  if (carregando) return <ActivityIndicator style={{ marginTop: 20 }} color="#2563EB" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avaliações dos Clientes</Text>
      <FlatList
        data={avaliacoes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.clienteNome}>{item.cliente_nome}</Text>
              <Text style={styles.stars}>{'⭐'.repeat(item.nota)}</Text>
            </View>
            <Text style={styles.comentario}>{item.comentario}</Text>

            {/* Exibe réplica se já responderam */}
            {item.replica_resposta ? (
              <View style={styles.replicaBox}>
                <Text style={styles.replicaHeader}>💬 Resposta Oficial do Profissional:</Text>
                <Text style={styles.replicaTexto}>{item.replica_resposta}</Text>
              </View>
            ) : eDonoDoPerfil ? (
              /* Formulário de Réplica para o Prestador */
              <View style={styles.formReply}>
                <TextInput
                  style={styles.inputReply}
                  placeholder="Escreva sua réplica transparente..."
                  onChangeText={(val) => setRespostas((prev) => ({ ...prev, [item.id]: val }))}
                />
                <TouchableOpacity style={styles.btnReply} onPress={() => enviarReplica(item.id)}>
                  <Text style={styles.btnReplyText}>Publicar Réplica</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  clienteNome: { fontWeight: 'bold', color: '#1E293B', fontSize: 15 },
  stars: { fontSize: 12 },
  comentario: { color: '#475569', fontSize: 14, lineHeight: 20 },
  replicaBox: { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, marginTop: 10, borderLeftWidth: 4, borderLeftColor: '#2563EB' },
  replicaHeader: { fontWeight: 'bold', color: '#1E3A8A', fontSize: 12, marginBottom: 2 },
  replicaTexto: { color: '#1E40AF', fontSize: 13 },
  formReply: { marginTop: 12 },
  inputReply: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, padding: 8, fontSize: 13, marginBottom: 6 },
  btnReply: { backgroundColor: '#2563EB', padding: 10, borderRadius: 6, alignItems: 'center' },
  btnReplyText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
});
