import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { api } from '../src/api/api';

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { signIn } = useAuth();
  const { colors } = useTheme();

  const handleAction = async () => {
    setErrorMsg('');
    if (!username || !password || (isRegister && !name)) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }
    
    setLoading(true);
    try {
      if (isRegister) {
        await api.post('/register', { username, password, name, role: 'admin' });
        Alert.alert('Sucesso', 'Conta criada! Você já pode entrar.');
        setIsRegister(false);
      } else {
        await signIn(username, password);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollArea: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    titleBox: {
      marginBottom: 40,
      alignItems: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text,
      opacity: 0.7,
    },
    card: {
      backgroundColor: colors.card,
      padding: 24,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    input: {
      backgroundColor: colors.background,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      fontSize: 16,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    switchText: {
      color: colors.primary,
      textAlign: 'center',
      marginTop: 24,
      fontWeight: 'bold'
    },
    errorText: {
      color: '#EF4444',
      textAlign: 'center',
      marginBottom: 16,
      fontWeight: 'bold',
    }
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollArea}>
        <View style={styles.titleBox}>
          <Text style={styles.title}>OracleLearn</Text>
          <Text style={styles.subtitle}>Plataforma Movel de Treinamentos</Text>
        </View>
        
        <View style={styles.card}>
          {isRegister && (
            <TextInput
              style={styles.input}
              placeholder="Seu Nome Completo"
              placeholderTextColor={colors.border}
              value={name}
              onChangeText={t => { setName(t); setErrorMsg(''); }}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Usuário"
            placeholderTextColor={colors.border}
            value={username}
            onChangeText={t => { setUsername(t); setErrorMsg(''); }}
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={colors.border}
            value={password}
            onChangeText={t => { setPassword(t); setErrorMsg(''); }}
            secureTextEntry
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          
          <TouchableOpacity style={styles.button} onPress={handleAction} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>{isRegister ? 'Criar Conta' : 'Entrar'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
            <Text style={styles.switchText}>
              {isRegister ? 'Já tenho conta, acessar!' : 'Não tem conta? Crie uma!'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
