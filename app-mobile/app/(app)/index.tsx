import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { EmptyState, ErrorState, LoadingState, MetricCard, PrimaryButton, ProgressBar, Screen } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useDashboard } from '../../src/hooks/useLearning';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const dashboard = useDashboard();

  if (dashboard.isLoading) return <LoadingState label="Carregando sua trilha..." />;
  if (dashboard.isError || !dashboard.data) {
    return <ErrorState message="Nao foi possivel carregar o painel." onRetry={() => dashboard.refetch()} />;
  }

  const { resumo, continuar } = dashboard.data;

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      paddingBottom: 28,
    },
    header: {
      gap: 6,
      marginBottom: 18,
    },
    hello: {
      color: colors.muted,
      fontSize: 14,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '900',
      lineHeight: 32,
    },
    metrics: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 18,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 10,
    },
    continueCard: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      gap: 12,
      padding: 16,
    },
    cardHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
    },
    courseTitle: {
      color: colors.text,
      flex: 1,
      fontSize: 18,
      fontWeight: '800',
    },
    description: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
    },
    progressLabel: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '700',
    },
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.hello}>Ola, {user?.name}</Text>
          <Text style={styles.title}>Sua jornada de aprendizagem</Text>
        </View>

        <View style={styles.metrics}>
          <MetricCard icon="school" label="Disponiveis" value={resumo.cursosDisponiveis} />
          <MetricCard icon="playlist-add-check" label="Matriculas" value={resumo.cursosMatriculados} />
          <MetricCard icon="check-circle" label="Aulas feitas" value={resumo.aulasConcluidas} />
          <MetricCard icon="workspace-premium" label="Certificados" value={resumo.certificadosEmitidos} />
        </View>

        <Text style={styles.sectionTitle}>Continuar curso</Text>
        {continuar ? (
          <View style={styles.continueCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="play-circle" size={30} color={colors.primary} />
              <Text style={styles.courseTitle}>{continuar.titulo}</Text>
            </View>
            <Text style={styles.description}>{continuar.descricao}</Text>
            <Text style={styles.progressLabel}>{continuar.progresso?.percentual || 0}% concluido</Text>
            <ProgressBar value={continuar.progresso?.percentual || 0} />
            <PrimaryButton
              icon="arrow-forward"
              label="Abrir proxima aula"
              onPress={() => router.push(`/cursos/${continuar.id}` as never)}
            />
          </View>
        ) : (
          <EmptyState
            description="Escolha um curso no catalogo para iniciar uma trilha e acompanhar seu progresso aqui."
            icon="menu-book"
            title="Nenhum curso em andamento"
          />
        )}
      </ScrollView>
    </Screen>
  );
}
