import React, { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CadastroPrestadorScreen } from './src/screens/CadastroPrestadorScreen';
import { CheckoutAssinaturaScreen } from './src/screens/CheckoutAssinaturaScreen';

export default function App() {
  const [step, setStep] = useState<number>(1);
  const [prestadorId, setPrestadorId] = useState<string>('');

  const handleCadastroSucesso = (id: string) => {
    setPrestadorId(id);
    setStep(2);
  };

  const handlePagamentoConfirmado = () => {
    setStep(3);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#030712" />
        {step === 1 && (
          <CadastroPrestadorScreen onCadastroSucesso={handleCadastroSucesso} />
        )}
        {step === 2 && (
          <CheckoutAssinaturaScreen 
            prestadorId={prestadorId} 
            onPagamentoConfirmado={handlePagamentoConfirmado} 
          />
        )}
        {step === 3 && (
          <View style={styles.center}>
            <CadastroPrestadorScreen onCadastroSucesso={handleCadastroSucesso} />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030712',
  }
});
