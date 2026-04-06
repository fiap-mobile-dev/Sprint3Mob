import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function PerfilScreen() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 24, alignItems: 'center' },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    name: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    role: { fontSize: 16, color: colors.text, opacity: 0.7, marginBottom: 32 },
    card: { backgroundColor: colors.card, width: '100%', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    cardText: { fontSize: 18, color: colors.text },
    logoutButton: { backgroundColor: 'red', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 'auto' },
    logoutText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
  });

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <MaterialIcons name="person" size={60} color="#FFF" />
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.role}>{user?.role === 'admin' ? 'Administrador' : 'Aluno'}</Text>

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <MaterialIcons name="dark-mode" size={24} color={colors.primary} />
          <Text style={styles.cardText}>Modo Escuro</Text>
        </View>
        <Switch 
          value={theme === 'dark'} 
          onValueChange={toggleTheme} 
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor={theme === 'dark' ? '#FFF' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>SAIR DA CONTA</Text>
      </TouchableOpacity>
    </View>
  );
}
