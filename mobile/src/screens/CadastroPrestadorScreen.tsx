// ==============================================================================
// PROJETO: Conexão Freelance
// ARQUIVO: src/screens/CadastroPrestadorScreen.tsx
// DESCRIÇÃO: Componente da Tela de Cadastro do Prestador em React Native (Etapa 1)
// ==============================================================================

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAnalyticsTracking } from '../hooks/useAnalyticsTracking';

// Lista pré-definida de profissões para o seletor visual
const LISTA_PROFISSOES = [
  'Eletricista',
  'Encanador / Bombeiro Hidráulico',
  'Pintor',
  'Marceneiro',
  'Pedreiro / Alvenaria',
  'Gesso / Drywall',
  'Jardinagem',
  'Montador de Móveis',
  'Serralheiro',
  'Chaveiro',
];

interface IFormState {
  nomeCompleto: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  profissao: string;
  fotoPerfilUrl: string;
}

interface ICadastroProps {
  onCadastroSucesso: (id: string) => void;
}

export const CadastroPrestadorScreen: React.FC<ICadastroProps> = ({ onCadastroSucesso }) => {
  const { rastrearEvento } = useAnalyticsTracking();

  // Estado principal do formulário
  const [formData, setFormData] = useState<IFormState>({
    nomeCompleto: '',
    whatsapp: '',
    cidade: '',
    estado: '',
    profissao: '',
    fotoPerfilUrl: '',
  });

  // Estado para controle de modal/dropdown de profissão
  const [dropdownAberto, setDropdownAberto] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erros, setErros] = useState<{ [key in keyof IFormState]?: string }>({});

  /**
   * Aplica máscara dinâmica ao número de WhatsApp no formato (XX) 9XXXX-XXXX
   */
  const aplicarMascaraWhatsapp = (texto: string): string => {
    const apenasNumeros = texto.replace(/\D/g, '');
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    }
    if (apenasNumeros.length <= 7) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    }
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
  };

  /**
   * Manipulador universal para atualização dos campos
   */
  const handleInputChange = (campo: keyof IFormState, valor: string) => {
    let valorFinal = valor;

    if (campo === 'whatsapp') {
      valorFinal = aplicarMascaraWhatsapp(valor);
    } else if (campo === 'estado') {
      valorFinal = valor.toUpperCase().slice(0, 2); // Força 2 letras maiúsculas
    }

    setFormData((prev) => ({ ...prev, [campo]: valorFinal }));

    // Limpa a mensagem de erro do campo editado
    if (erros[campo]) {
      setErros((prev) => ({ ...prev, [campo]: undefined }));
    }
  };

  /**
   * Validação local completa antes de disparar requisição HTTP
   */
  const validarFormulario = (): boolean => {
    const novosErros: { [key in keyof IFormState]?: string } = {};

    if (!formData.nomeCompleto.trim()) {
      novosErros.nomeCompleto = 'Por favor, informe seu nome completo.';
    }

    const numerosWhatsapp = formData.whatsapp.replace(/\D/g, '');
    if (numerosWhatsapp.length < 10 || numerosWhatsapp.length > 11) {
      novosErros.whatsapp = 'Digite um número de WhatsApp válido com DDD.';
    }

    if (!formData.cidade.trim()) {
      novosErros.cidade = 'A cidade é obrigatória.';
    }

    if (formData.estado.trim().length !== 2) {
      novosErros.estado = 'UF (2 letras).';
    }

    if (!formData.profissao.trim()) {
      novosErros.profissao = 'Selecione uma profissão principal.';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  /**
   * Função para envio dos dados cadastrais à API Backend
   */
  const enviarCadastro = async () => {
    if (!validarFormulario()) {
      Alert.alert('Campos Incompletos', 'Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch('https://conexao-freelance-production.up.railway.app/api/prestadores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome_completo: formData.nomeCompleto,
          whatsapp: formData.whatsapp,
          cidade: formData.cidade,
          estado: formData.estado,
          profissao: formData.profissao,
          foto_perfil_url: formData.fotoPerfilUrl,
        }),
      });

      const resultado = await resposta.json();

      if (resposta.ok && resultado.sucesso) {
        // Dispara evento Lead com profissão selecionada no app
        rastrearEvento('Lead', { phone: formData.whatsapp }, { content_name: formData.profissao, currency: 'BRL', value: 29.90 });

        Alert.alert(
          '🎉 Cadastro Recebido!',
          'Seu perfil foi registrado com sucesso e está pendente de ativação para começar a receber clientes.',
          [
            {
              text: 'Pagar Assinatura',
              onPress: () => {
                const prestadorId = resultado.dados?.id || 'temp';
                // Limpa o formulário após sucesso
                setFormData({ nomeCompleto: '', whatsapp: '', cidade: '', estado: '', profissao: '', fotoPerfilUrl: '' });
                onCadastroSucesso(prestadorId);
              },
            },
          ]
        );
      } else {
        Alert.alert('Atenção', resultado.mensagem || 'Falha ao processar o cadastro.');
      }
    } catch (error) {
      console.error('Erro de conexão no cadastro:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Cabeçalho da Tela */}
          <View style={styles.header}>
            <Text style={styles.title}>Conexão Freelance</Text>
            <Text style={styles.subtitle}>Cadastre seu perfil profissional e receba pedidos de serviço na sua região</Text>
          </View>

          {/* Cartão do Formulário */}
          <View style={styles.formCard}>
            
            {/* Campo Nome Completo */}
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={[styles.input, erros.nomeCompleto ? styles.inputError : null]}
              placeholder="Ex: Carlos Alberto Silva"
              placeholderTextColor="#94A3B8"
              value={formData.nomeCompleto}
              onChangeText={(val) => handleInputChange('nomeCompleto', val)}
            />
            {erros.nomeCompleto ? <Text style={styles.errorText}>{erros.nomeCompleto}</Text> : null}

            {/* Campo Foto de Perfil */}
            <Text style={styles.label}>Link da Foto de Perfil (URL)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://sua-foto-aqui.jpg (Opcional)"
              placeholderTextColor="#94A3B8"
              value={formData.fotoPerfilUrl}
              onChangeText={(val) => handleInputChange('fotoPerfilUrl', val)}
            />

            {/* Campo WhatsApp */}
            <Text style={styles.label}>WhatsApp / Celular *</Text>
            <TextInput
              style={[styles.input, erros.whatsapp ? styles.inputError : null]}
              placeholder="(11) 99999-9999"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              maxLength={15}
              value={formData.whatsapp}
              onChangeText={(val) => handleInputChange('whatsapp', val)}
            />
            {erros.whatsapp ? <Text style={styles.errorText}>{erros.whatsapp}</Text> : null}

            {/* Linha Dupla: Cidade e Estado */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Cidade *</Text>
                <TextInput
                  style={[styles.input, erros.cidade ? styles.inputError : null]}
                  placeholder="Ex: São Paulo"
                  placeholderTextColor="#94A3B8"
                  value={formData.cidade}
                  onChangeText={(val) => handleInputChange('cidade', val)}
                />
                {erros.cidade ? <Text style={styles.errorText}>{erros.cidade}</Text> : null}
              </View>

              <View style={{ width: 80, marginLeft: 10 }}>
                <Text style={styles.label}>UF *</Text>
                <TextInput
                  style={[styles.input, erros.estado ? styles.inputError : null]}
                  placeholder="SP"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                  maxLength={2}
                  value={formData.estado}
                  onChangeText={(val) => handleInputChange('estado', val)}
                />
                {erros.estado ? <Text style={styles.errorText}>{erros.estado}</Text> : null}
              </View>
            </View>

            {/* Seletor Visual de Profissão */}
            <Text style={styles.label}>Profissão Principal *</Text>
            <TouchableOpacity
              style={[styles.selectorButton, erros.profissao ? styles.inputError : null]}
              onPress={() => setDropdownAberto(!dropdownAberto)}
              activeOpacity={0.8}
            >
              <Text style={formData.profissao ? styles.selectorTextSelected : styles.selectorTextPlaceholder}>
                {formData.profissao || 'Selecione sua profissão...'}
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B' }}>{dropdownAberto ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {erros.profissao ? <Text style={styles.errorText}>{erros.profissao}</Text> : null}

            {/* Lista expansível de profissões */}
            {dropdownAberto ? (
              <View style={styles.dropdownList}>
                {LISTA_PROFISSOES.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('profissao', item);
                      setDropdownAberto(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, formData.profissao === item ? styles.dropdownItemActive : null]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* Botão de Cadastro */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={enviarCadastro}
              disabled={carregando}
              activeOpacity={0.85}
            >
              {carregando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Cadastrar Meu Perfil</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  errorText: { color: '#EF4444', fontSize: 11, marginTop: 4, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  flex1: { flex: 1 },
  selectorButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorTextPlaceholder: { fontSize: 15, color: '#94A3B8' },
  selectorTextSelected: { fontSize: 15, color: '#0F172A', fontWeight: '500' },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 180,
    elevation: 4,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemText: { fontSize: 14, color: '#334155' },
  dropdownItemActive: { color: '#2563EB', fontWeight: 'bold' },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 26,
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
