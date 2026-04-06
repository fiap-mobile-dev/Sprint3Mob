import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../../src/context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../src/api/api';
import { MaterialIcons } from '@expo/vector-icons';

export default function AulaReadingScreen() {
  const { id, aulaIndex } = useLocalSearchParams();
  const { colors } = useTheme();
  const router = useRouter();
  const [completed, setCompleted] = useState(false);

  const parsedIndex = parseInt(aulaIndex as string);

  const { data: curso, isLoading, isError } = useQuery({
    queryKey: ['curso', id],
    queryFn: async () => {
      const resp = await api.get(`/cursos/${id}`);
      return resp.data;
    }
  });

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: 24, paddingBottom: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
    content: { padding: 24 },
    badge: { alignSelf: 'flex-start', backgroundColor: colors.primary + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginBottom: 12 },
    badgeText: { color: colors.primary, fontWeight: 'bold', fontSize: 12 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8, lineHeight: 32 },
    courseInfo: { fontSize: 12, color: colors.text, opacity: 0.6, fontWeight: 'bold', textTransform: 'uppercase' },
    lessonContent: { fontSize: 18, color: colors.text, opacity: 0.9, lineHeight: 28, marginTop: 16 },
    button: { backgroundColor: completed ? '#10B981' : colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 40, flexDirection: 'row', justifyContent: 'center', gap: 8 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
  });

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (isError || !curso || !curso.aulas) return <View style={styles.center}><Text style={{ color: 'red' }}>Erro ao carregar os dados da aula.</Text></View>;

  const aula = curso.aulas[parsedIndex];

  if (!aula) {
    return (
      <View style={styles.center}>
        <Text style={{color: colors.text}}>Aula não encontrada no índice {parsedIndex}</Text>
        <TouchableOpacity style={{marginTop: 16}} onPress={() => router.back()}><Text style={{color: colors.primary}}>Voltar</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Aula {parsedIndex + 1} de {curso.aulas.length}</Text>
        </View>
        <Text style={styles.title}>{aula.titulo}</Text>
        <Text style={styles.courseInfo}>Curso: {curso.titulo}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.lessonContent}>{aula.conteudo}</Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => {
            setCompleted(!completed);
            if (!completed) router.back();
          }}
        >
          <MaterialIcons name={completed ? "check-circle" : "check"} size={24} color="#FFF" />
          <Text style={styles.buttonText}>{completed ? 'Aula Finalizada!' : 'Marcar como Concluída e Sair'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: 'transparent', borderColor: colors.primary, borderWidth: 1, marginTop: 16, marginBottom: 40 }]} 
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>Voltar para Grade</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
