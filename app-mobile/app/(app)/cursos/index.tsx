import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '../../../src/api/api';
import { useTheme } from '../../../src/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

interface Curso {
  id: number;
  titulo: string;
  descricao: string;
  cargaHoraria: number;
  instrutor: string;
}

export default function CursosScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const { data: cursos, isLoading, isError, refetch, isRefetching } = useQuery<Curso[]>({
    queryKey: ['cursos'],
    queryFn: async () => {
      const resp = await api.get('/cursos');
      return resp.data;
    }
  });

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    card: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    infoContainer: { flex: 1 },
    title: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    subtitle: { fontSize: 14, color: colors.text, opacity: 0.7 },
    errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro ao carregar os cursos.</Text>
        <TouchableOpacity onPress={() => refetch()} style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ color: colors.primary }}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cursos}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={refetch}
        refreshing={isRefetching}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/cursos/${item.id}`)}
          >
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{item.titulo}</Text>
              <Text style={styles.subtitle}>{item.instrutor} • {item.cargaHoraria} horas</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
