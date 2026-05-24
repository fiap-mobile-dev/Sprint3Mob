import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { PrimaryButton } from '../src/components/ui';

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { signIn, signUp } = useAuth();
  const { colors } = useTheme();

  const handleAction = async () => {
    setErrorMsg('');

    if (!login.trim() || !password.trim() || (isRegister && !name.trim())) {
      setErrorMsg('Preencha todos os campos obrigatorios.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await signUp(name.trim(), login.trim(), password);
      } else {
        await signIn(login.trim(), password);
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Nao foi possivel autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    scrollArea: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    brand: {
      marginBottom: 28,
    },
    eyebrow: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0,
      textTransform: 'uppercase',
    },
    title: {
      color: colors.primary,
      fontSize: 34,
      fontWeight: '900',
      marginTop: 6,
    },
    subtitle: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 22,
      marginTop: 8,
    },
    form: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      gap: 12,
      padding: 18,
    },
    input: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      color: colors.text,
      fontSize: 16,
      minHeight: 50,
      paddingHorizontal: 14,
    },
    errorText: {
      color: colors.danger,
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
    },
    switchButton: {
      marginTop: 16,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollArea} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Text style={styles.eyebrow}>Plataforma mobile de treinamentos</Text>
          <Text style={styles.title}>OracleLearn</Text>
          <Text style={styles.subtitle}>
            Acesse cursos, acompanhe sua evolucao e conclua trilhas com certificado.
          </Text>
        </View>

        <View style={styles.form}>
          {isRegister ? (
            <TextInput
              autoCapitalize="words"
              onChangeText={(text) => {
                setName(text);
                setErrorMsg('');
              }}
              placeholder="Nome completo"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={name}
            />
          ) : null}

          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(text) => {
              setLogin(text);
              setErrorMsg('');
            }}
            placeholder="E-mail ou usuario"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={login}
          />

          <TextInput
            onChangeText={(text) => {
              setPassword(text);
              setErrorMsg('');
            }}
            placeholder="Senha"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <PrimaryButton
            icon={isRegister ? 'person-add' : 'login'}
            label={isRegister ? 'Criar conta' : 'Entrar'}
            loading={loading}
            onPress={handleAction}
          />

          <PrimaryButton
            icon={isRegister ? 'arrow-back' : 'person-add-alt'}
            label={isRegister ? 'Ja tenho conta' : 'Criar nova conta'}
            onPress={() => {
              setIsRegister((value) => !value);
              setErrorMsg('');
            }}
            style={styles.switchButton}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
