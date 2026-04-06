import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../src/api/api';
import { useTheme } from '../../../src/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

interface Aula { id?: number; titulo: string; conteudo: string; }
interface Curso {
  id: number;
  titulo: string;
  descricao: string;
  cargaHoraria: number;
  instrutor: string;
  aulas?: Aula[];
}

export default function CursoDetalhesScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const router = useRouter();

  const { data: curso, isLoading, isError } = useQuery<Curso>({
    queryKey: ['curso', id],
    queryFn: async () => {
      const resp = await api.get(`/cursos/${id}`);
      return resp.data;
    }
  });

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
    subtitle: { fontSize: 16, color: colors.text, opacity: 0.8, marginBottom: 24 },
    label: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginTop: 16 },
    text: { fontSize: 16, color: colors.text, marginBottom: 8, lineHeight: 24 },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 32,
    },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
  });

  if (isLoading) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (isError || !curso) return <View style={[styles.container, styles.center]}><Text style={{ color: 'red' }}>Erro ao buscar curso.</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{curso.titulo}</Text>
      <Text style={styles.subtitle}>Por {curso.instrutor} • {curso.cargaHoraria} horas</Text>
      
      <Text style={styles.label}>Sobre o curso:</Text>
      <Text style={styles.text}>{curso.descricao}</Text>

      <Text style={[styles.label, { marginTop: 24, marginBottom: 16, fontSize: 18 }]}>Módulos do Curso</Text>
      
      {curso.aulas && curso.aulas.length > 0 ? (
        curso.aulas.map((aula, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.button, { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }]} 
            onPress={() => router.push(`/cursos/aula/${id}?aulaIndex=${index}`)}
          >
            <Text style={styles.buttonText}>Aula {index + 1}: {aula.titulo}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#FFF" />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={[styles.text, { opacity: 0.5, fontStyle: 'italic' }]}>Nenhuma aula cadastrada ainda.</Text>
      )}
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: 'transparent', borderColor: colors.primary, borderWidth: 1, marginTop: 32, marginBottom: 40 }]} 
        onPress={() => router.back()}
      >
        <Text style={[styles.buttonText, { color: colors.primary }]}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
