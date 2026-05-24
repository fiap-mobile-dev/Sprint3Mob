import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { EmptyState, ErrorState, LoadingState, Screen } from '../../src/components/ui';
import { useTheme } from '../../src/context/ThemeContext';
import { useCertificates } from '../../src/hooks/useLearning';
import { Certificado } from '../../src/types/domain';

export default function CertificadosScreen() {
  const { colors } = useTheme();
  const certificates = useCertificates();

  const styles = StyleSheet.create({
    list: {
      padding: 16,
      paddingBottom: 28,
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      gap: 10,
      marginBottom: 12,
      padding: 16,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
    },
    title: {
      color: colors.text,
      flex: 1,
      fontSize: 18,
      fontWeight: '900',
      lineHeight: 24,
    },
    meta: {
      color: colors.muted,
      fontSize: 13,
      lineHeight: 19,
    },
    code: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '800',
    },
  });

  const renderCertificate = ({ item }: { item: Certificado }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name="workspace-premium" size={34} color={colors.primary} />
        <Text style={styles.title}>{item.cursoTitulo}</Text>
      </View>
      <Text style={styles.meta}>
        Emitido em {new Date(item.issuedAt).toLocaleDateString('pt-BR')} - {item.cargaHoraria}h
      </Text>
      <Text style={styles.code}>{item.codigo}</Text>
    </View>
  );

  if (certificates.isLoading) return <LoadingState label="Consultando certificados..." />;
  if (certificates.isError) {
    return <ErrorState message="Nao foi possivel carregar certificados." onRetry={() => certificates.refetch()} />;
  }

  return (
    <Screen>
      <FlatList
        contentContainerStyle={styles.list}
        data={certificates.data || []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            description="Conclua todas as aulas de um curso para emitir automaticamente seu certificado."
            icon="workspace-premium"
            title="Nenhum certificado emitido"
          />
        }
        onRefresh={certificates.refetch}
        refreshing={certificates.isRefetching}
        renderItem={renderCertificate}
      />
    </Screen>
  );
}
