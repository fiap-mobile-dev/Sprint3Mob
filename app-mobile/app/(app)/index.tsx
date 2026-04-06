import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/api/api';
import { MaterialIcons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  const { data: cursos } = useQuery({
    queryKey: ['cursos-dashboard'],
    queryFn: async () => {
      const resp = await api.get('/cursos');
      return resp.data;
    }
  });

  const totalCursos = cursos?.length || 0;
  const horasTotais = cursos?.reduce((acc: number, curr: any) => acc + (curr.cargaHoraria || 0), 0) || 0;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    cardsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    card: {
      backgroundColor: colors.card,
      width: '48%',
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.7,
      marginTop: 8,
    },
    cardValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 4,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Olá, {user?.name}</Text>
      
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <MaterialIcons name="school" size={32} color={colors.primary} />
          <Text style={styles.cardTitle}>Cursos Ativos</Text>
          <Text style={styles.cardValue}>{totalCursos}</Text>
        </View>
        <View style={styles.card}>
          <MaterialIcons name="timer" size={32} color={colors.primary} />
          <Text style={styles.cardTitle}>Horas Cursadas</Text>
          <Text style={styles.cardValue}>{horasTotais}h</Text>
        </View>
        <View style={styles.card}>
          <MaterialIcons name="emoji-events" size={32} color={colors.primary} />
          <Text style={styles.cardTitle}>Certificados</Text>
          <Text style={styles.cardValue}>3</Text>
        </View>
      </View>
    </ScrollView>
  );
}
