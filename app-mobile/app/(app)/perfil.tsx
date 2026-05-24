import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryButton, Screen } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function PerfilScreen() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    content: {
      padding: 20,
      paddingBottom: 32,
    },
    profileCard: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      gap: 8,
      marginBottom: 16,
      padding: 20,
    },
    avatar: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 42,
      height: 84,
      justifyContent: 'center',
      width: 84,
    },
    name: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '900',
      marginTop: 8,
      textAlign: 'center',
    },
    role: {
      color: colors.muted,
      fontSize: 14,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    item: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      minHeight: 58,
      paddingHorizontal: 14,
    },
    itemLeft: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
    },
    itemText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    logout: {
      marginTop: 8,
    },
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>{user?.role === 'admin' ? 'Administrador' : 'Aluno'}</Text>
        </View>

        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <MaterialIcons name="dark-mode" size={24} color={colors.primary} />
            <Text style={styles.itemText}>Modo escuro</Text>
          </View>
          <Switch
            onValueChange={toggleTheme}
            thumbColor={theme === 'dark' ? '#FFFFFF' : '#F4F3F4'}
            trackColor={{ false: '#98A2B3', true: colors.primary }}
            value={theme === 'dark'}
          />
        </View>

        <TouchableOpacity style={styles.item} onPress={() => router.push('/sobre' as never)}>
          <View style={styles.itemLeft}>
            <MaterialIcons name="info" size={24} color={colors.primary} />
            <Text style={styles.itemText}>Sobre o app</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
        </TouchableOpacity>

        <PrimaryButton
          icon="logout"
          label="Sair da conta"
          onPress={signOut}
          style={styles.logout}
          variant="danger"
        />
      </ScrollView>
    </Screen>
  );
}
