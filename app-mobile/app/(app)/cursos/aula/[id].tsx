import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ErrorState, LoadingState, PrimaryButton, ProgressBar, Screen } from '../../../../src/components/ui';
import { useTheme } from '../../../../src/context/ThemeContext';
import { useCompleteLesson, useLesson } from '../../../../src/hooks/useLearning';
import { getApiErrorMessage } from '../../../../src/services/http';

export default function AulaReadingScreen() {
  const { id, aulaId } = useLocalSearchParams<{ id: string; aulaId?: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const lesson = useLesson(id, aulaId);
  const completeLesson = useCompleteLesson();

  if (lesson.isLoading) return <LoadingState label="Carregando conteudo real da aula..." />;
  if (lesson.isError || !lesson.data) {
    return <ErrorState message="Erro ao carregar os dados da aula." onRetry={() => lesson.refetch()} />;
  }

  const { curso, aula } = lesson.data;
  const completed = Boolean(aula && curso.progresso?.aulasConcluidasIds.includes(aula.id));

  const handleComplete = async () => {
    try {
      await completeLesson.mutateAsync({
        cursoId: curso.id,
        aulaId: aula.id,
        aulaTitulo: aula.titulo,
        cursoTitulo: curso.titulo,
      });
      Alert.alert('Progresso atualizado', 'Aula registrada com sucesso.');
    } catch (error) {
      Alert.alert('Falha ao concluir aula', getApiErrorMessage(error));
    }
  };

  const styles = StyleSheet.create({
    content: {
      paddingBottom: 36,
    },
    header: {
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      gap: 10,
      padding: 20,
    },
    badge: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: completed ? colors.success : colors.primary,
      borderRadius: 999,
      flexDirection: 'row',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '900',
      lineHeight: 31,
    },
    courseInfo: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    metaLine: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 19,
    },
    body: {
      gap: 16,
      padding: 20,
    },
    paragraph: {
      color: colors.text,
      fontSize: 17,
      lineHeight: 28,
    },
    progressLabel: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '700',
    },
    actions: {
      gap: 10,
      marginTop: 14,
    },
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <MaterialIcons name={completed ? 'check-circle' : 'menu-book'} size={16} color="#FFFFFF" />
            <Text style={styles.badgeText}>{completed ? 'Concluida' : 'Em leitura'}</Text>
          </View>
          <Text style={styles.title}>{aula.titulo}</Text>
          <Text style={styles.courseInfo}>Curso: {curso.titulo}</Text>
          <Text style={styles.metaLine}>
            {aula.duracaoMinutos} minutos
            {aula.totalDesafios ? ` - ${aula.totalDesafios} desafios praticos` : ''}
            {curso.source === 'freecodecamp' ? ' - fonte freeCodeCamp' : ''}
          </Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.paragraph}>{aula.conteudo}</Text>
          <Text style={styles.progressLabel}>{curso.progresso?.percentual || 0}% do curso concluido</Text>
          <ProgressBar value={curso.progresso?.percentual || 0} />

          <View style={styles.actions}>
            <PrimaryButton
              disabled={completed}
              icon={completed ? 'check-circle' : 'check'}
              label={completed ? 'Aula ja concluida' : 'Marcar como concluida'}
              loading={completeLesson.isPending}
              onPress={handleComplete}
            />
            <PrimaryButton
              icon="arrow-back"
              label="Voltar ao curso"
              onPress={() => router.push(`/cursos/${curso.id}` as never)}
              variant="secondary"
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
