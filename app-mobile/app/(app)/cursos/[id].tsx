import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { EmptyState, ErrorState, LoadingState, PrimaryButton, ProgressBar, Screen } from '../../../src/components/ui';
import { useTheme } from '../../../src/context/ThemeContext';
import { useCourse, useEnrollCourse } from '../../../src/hooks/useLearning';
import { getApiErrorMessage } from '../../../src/services/http';
import { Aula } from '../../../src/types/domain';

export default function CursoDetalhesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const course = useCourse(id);
  const enroll = useEnrollCourse();

  if (course.isLoading) return <LoadingState label="Abrindo curso..." />;
  if (course.isError || !course.data) {
    return <ErrorState message="Erro ao buscar curso." onRetry={() => course.refetch()} />;
  }

  const curso = course.data;
  const progresso = curso.progresso;
  const completedIds = progresso?.aulasConcluidasIds || [];
  const nextLesson = curso.aulas.find((aula) => !completedIds.includes(aula.id)) || curso.aulas[0];
  const totalChallenges = curso.aulas.reduce((total, aula) => total + (aula.totalDesafios || 0), 0);

  const handleEnroll = async () => {
    try {
      await enroll.mutateAsync({ cursoId: curso.id, cursoTitulo: curso.titulo });
    } catch (error) {
      Alert.alert('Falha na matricula', getApiErrorMessage(error));
    }
  };

  const openLesson = (aula: Aula) => {
    if (!progresso?.matriculado) {
      Alert.alert('Matricula necessaria', 'Matricule-se no curso para acessar as aulas.');
      return;
    }

    router.push(`/cursos/aula/${curso.id}?aulaId=${aula.id}` as never);
  };

  const styles = StyleSheet.create({
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    header: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      gap: 12,
      padding: 16,
    },
    title: {
      color: colors.text,
      fontSize: 25,
      fontWeight: '900',
      lineHeight: 31,
    },
    meta: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    badge: {
      borderColor: colors.border,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgePrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    badgeText: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
    },
    badgePrimaryText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },
    description: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 22,
    },
    progressLabel: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '700',
    },
    actions: {
      gap: 10,
      marginTop: 4,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 10,
      marginTop: 22,
    },
    lesson: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      marginBottom: 10,
      padding: 14,
    },
    lessonText: {
      flex: 1,
      gap: 3,
    },
    lessonTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
      lineHeight: 20,
    },
    lessonMeta: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '600',
    },
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{curso.titulo}</Text>
          <Text style={styles.meta}>
            {curso.instrutor} - {curso.cargaHoraria}h - {curso.nivel} - {curso.categoria}
          </Text>
          <View style={styles.badges}>
            {curso.source === 'freecodecamp' ? (
              <View style={[styles.badge, styles.badgePrimary]}>
                <Text style={styles.badgePrimaryText}>Curriculo real freeCodeCamp</Text>
              </View>
            ) : null}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{curso.aulas.length} modulos</Text>
            </View>
            {totalChallenges ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalChallenges} desafios praticos</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.description}>{curso.descricao}</Text>
          <Text style={styles.progressLabel}>{progresso?.percentual || 0}% concluido</Text>
          <ProgressBar value={progresso?.percentual || 0} />

          <View style={styles.actions}>
            {progresso?.certificadoEmitido ? (
              <PrimaryButton
                icon="workspace-premium"
                label="Ver certificado"
                onPress={() => router.push('/certificados' as never)}
              />
            ) : progresso?.matriculado ? (
              <PrimaryButton
                icon="play-arrow"
                label="Continuar aulas"
                onPress={() => nextLesson && openLesson(nextLesson)}
              />
            ) : (
              <PrimaryButton
                icon="playlist-add"
                label="Matricular-se"
                loading={enroll.isPending}
                onPress={handleEnroll}
              />
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Modulos do curso</Text>
        {curso.aulas.length ? (
          curso.aulas.map((aula, index) => {
            const completed = completedIds.includes(aula.id);
            return (
              <TouchableOpacity key={aula.id} onPress={() => openLesson(aula)} style={styles.lesson}>
                <MaterialIcons
                  color={completed ? colors.success : progresso?.matriculado ? colors.primary : colors.muted}
                  name={completed ? 'check-circle' : progresso?.matriculado ? 'play-circle' : 'lock'}
                  size={28}
                />
                <View style={styles.lessonText}>
                  <Text style={styles.lessonTitle}>
                    Aula {index + 1}: {aula.titulo}
                  </Text>
                  <Text style={styles.lessonMeta}>{aula.duracaoMinutos} minutos</Text>
                  {aula.totalDesafios ? (
                    <Text style={styles.lessonMeta}>{aula.totalDesafios} desafios no modulo</Text>
                  ) : null}
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
              </TouchableOpacity>
            );
          })
        ) : (
          <EmptyState
            description="Este curso ainda nao possui aulas publicadas pelo administrador."
            icon="playlist-remove"
            title="Sem aulas cadastradas"
          />
        )}
      </ScrollView>
    </Screen>
  );
}
