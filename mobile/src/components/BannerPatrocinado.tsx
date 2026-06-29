// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/components/BannerPatrocinado.tsx
// DESCRIÇÃO: Componente de Card Patrocinado em React Native (Etapa 4)
// ==============================================================================

import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Linking } from 'react-native';

interface IAnuncioProps {
  anuncio: {
    id: string;
    titulo: string;
    imagem_banner_url: string;
    link_destino: string;
  } | null;
}

export const BannerPatrocinado: React.FC<IAnuncioProps> = ({ anuncio }) => {
  if (!anuncio) return null;

  const handlePress = async () => {
    try {
      // Registra o clique no backend
      fetch('http://localhost:3000/api/anuncios/clique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anuncio_id: anuncio.id }),
      });
      // Abre o link de destino no navegador do celular
      Linking.openURL(anuncio.link_destino);
    } catch (e) {
      console.error('Erro ao processar clique do anúncio:', e);
    }
  };

  return (
    <TouchableOpacity style={styles.bannerCard} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.badge}><Text style={styles.badgeText}>PATROCINADO</Text></View>
      <Image source={{ uri: anuncio.imagem_banner_url }} style={styles.image} resizeMode="cover" />
      <Text style={styles.title}>{anuncio.titulo}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 10,
  },
  badgeText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 10 },
  image: { width: '100%', height: 110 },
  title: { padding: 12, fontWeight: 'bold', color: '#0F172A', fontSize: 14 },
});
