import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { EmptyState, ErrorState, LoadingState, ProgressBar, Screen } from '../../../src/components/ui';
import { useTheme } from '../../../src/context/ThemeContext';
import { useCourses } from '../../../src/hooks/useLearning';
import { Curso } from '../../../src/types/domain';

export default function CursosScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const courses = useCourses();

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return courses.data || [];
    return (courses.data || []).filter((curso) =>
      [curso.titulo, curso.descricao, curso.instrutor, curso.categoria]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [courses.data, search]);

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      paddingBottom: 28,
    },
    search: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      color: colors.text,
      fontSize: 15,
      marginBottom: 14,
      minHeight: 48,
      paddingHorizontal: 14,
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      gap: 10,
      marginBottom: 12,
      padding: 14,
    },
    cardHeader: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 10,
    },
    iconBox: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    cardTitle: {
      color: colors.text,
      flex: 1,
      fontSize: 17,
      fontWeight: '800',
      lineHeight: 22,
    },
    meta: {
      color: colors.muted,
      fontSize: 13,
      lineHeight: 18,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    badge: {
      borderColor: colors.border,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    sourceBadge: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
    },
    sourceBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },
    progressLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
    },
  });

  const renderCourse = ({ item }: { item: Curso }) => {
    const progress = item.progresso?.percentual || 0;
    const badge = item.progresso?.certificadoEmitido
      ? 'Certificado'
      : item.progresso?.matriculado
        ? 'Em andamento'
        : item.nivel;
    const challenges = item.aulas.reduce((total, aula) => total + (aula.totalDesafios || 0), 0);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/cursos/${item.id}` as never)}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <MaterialIcons name="school" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.cardTitle}>{item.titulo}</Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
        </View>
        <Text style={styles.meta}>
          {item.instrutor} - {item.cargaHoraria}h - {item.categoria}
          {challenges ? ` - ${challenges} desafios` : ''}
        </Text>
        <View style={styles.row}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
            {item.source === 'freecodecamp' ? (
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceBadgeText}>freeCodeCamp</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.progressLabel}>{progress}% concluido</Text>
        </View>
        <ProgressBar value={progress} />
      </TouchableOpacity>
    );
  };

  if (courses.isLoading) return <LoadingState label="Buscando cursos..." />;
  if (courses.isError) {
    return <ErrorState message="Erro ao carregar os cursos." onRetry={() => courses.refetch()} />;
  }

  return (
    <Screen>
      <FlatList
        contentContainerStyle={styles.container}
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            description="Nenhum curso combina com a busca atual."
            icon="search-off"
            title="Curso nao encontrado"
          />
        }
        ListHeaderComponent={
          <TextInput
            onChangeText={setSearch}
            placeholder="Buscar por curso, instrutor ou categoria"
            placeholderTextColor={colors.muted}
            style={styles.search}
            value={search}
          />
        }
        onRefresh={courses.refetch}
        refreshing={courses.isRefetching}
        renderItem={renderCourse}
      />
    </Screen>
  );
}
