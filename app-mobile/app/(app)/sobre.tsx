import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui';
import { useTheme } from '../../src/context/ThemeContext';

export default function SobreScreen() {
  const { colors } = useTheme();
  const version = Constants.expoConfig?.version || '1.0.0';
  const commitHash = String(Constants.expoConfig?.extra?.commitHash || 'local-dev');
  const apiUrl = String(Constants.expoConfig?.extra?.apiUrl || 'nao configurada');

  const styles = StyleSheet.create({
    content: {
      gap: 14,
      padding: 20,
      paddingBottom: 32,
    },
    header: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      gap: 8,
      padding: 22,
    },
    title: {
      color: colors.primary,
      fontSize: 28,
      fontWeight: '900',
    },
    subtitle: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      gap: 10,
      padding: 16,
    },
    label: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    value: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 21,
    },
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <MaterialIcons name="school" size={42} color={colors.primary} />
          <Text style={styles.title}>OracleLearn</Text>
          <Text style={styles.subtitle}>
            Aplicativo mobile final para gestao de treinamentos, progresso e certificados.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Versao publicada</Text>
          <Text style={styles.value}>v{version}</Text>
          <Text style={styles.label}>Commit de referencia</Text>
          <Text style={styles.value}>{commitHash}</Text>
          <Text style={styles.label}>API configurada</Text>
          <Text style={styles.value}>{apiUrl}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Integrantes</Text>
          <Text style={styles.value}>Gustavo Ramos - RM 561055</Text>
          <Text style={styles.value}>Arthur Henrique - RM 560820</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
