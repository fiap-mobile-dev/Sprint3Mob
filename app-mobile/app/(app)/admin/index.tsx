import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { EmptyState, ErrorState, LoadingState, PrimaryButton, Screen } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { useCourses, useDeleteCourse, useSaveCourse } from '../../../src/hooks/useLearning';
import { getApiErrorMessage } from '../../../src/services/http';
import { Aula, Curso } from '../../../src/types/domain';

type FormAula = Partial<Aula> & { titulo: string; conteudo: string; duracaoMinutos: number };
type CourseForm = {
  id?: string;
  titulo: string;
  descricao: string;
  instrutor: string;
  cargaHoraria: string;
  nivel: string;
  categoria: string;
  aulas: FormAula[];
};

const emptyForm: CourseForm = {
  titulo: '',
  descricao: '',
  instrutor: '',
  cargaHoraria: '',
  nivel: 'Fundamentos',
  categoria: 'Geral',
  aulas: [{ titulo: '', conteudo: '', duracaoMinutos: 30 }],
};

export default function AdminScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const courses = useCourses();
  const saveCourse = useSaveCourse();
  const deleteCourse = useDeleteCourse();
  const [form, setForm] = useState<CourseForm>(emptyForm);

  const editing = Boolean(form.id);

  const publishedCourses = useMemo(
    () => (courses.data || []).filter((curso) => curso.source !== 'freecodecamp'),
    [courses.data]
  );

  const resetForm = () => {
    setForm({ ...emptyForm, aulas: [{ titulo: '', conteudo: '', duracaoMinutos: 30 }] });
  };

  const updateAula = (index: number, patch: Partial<FormAula>) => {
    setForm((current) => ({
      ...current,
      aulas: current.aulas.map((aula, aulaIndex) =>
        aulaIndex === index ? { ...aula, ...patch } : aula
      ),
    }));
  };

  const addAula = () => {
    setForm((current) => ({
      ...current,
      aulas: [...current.aulas, { titulo: '', conteudo: '', duracaoMinutos: 30 }],
    }));
  };

  const removeAula = (index: number) => {
    setForm((current) => ({
      ...current,
      aulas: current.aulas.filter((_aula, aulaIndex) => aulaIndex !== index),
    }));
  };

  const startEdit = (curso: Curso) => {
    setForm({
      id: curso.id,
      titulo: curso.titulo,
      descricao: curso.descricao,
      instrutor: curso.instrutor,
      cargaHoraria: String(curso.cargaHoraria),
      nivel: curso.nivel,
      categoria: curso.categoria,
      aulas: curso.aulas.map((aula) => ({ ...aula })),
    });
  };

  const handleSave = async () => {
    const payload = {
      id: form.id,
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      instrutor: form.instrutor.trim(),
      cargaHoraria: Number(form.cargaHoraria),
      nivel: form.nivel.trim() || 'Fundamentos',
      categoria: form.categoria.trim() || 'Geral',
      aulas: form.aulas,
    };

    if (!payload.titulo || !payload.descricao || !payload.instrutor || !payload.cargaHoraria) {
      Alert.alert('Dados incompletos', 'Preencha titulo, descricao, instrutor e carga horaria.');
      return;
    }

    if (!payload.aulas.some((aula) => aula.titulo.trim() && aula.conteudo.trim())) {
      Alert.alert('Aulas obrigatorias', 'Cadastre pelo menos uma aula com titulo e conteudo.');
      return;
    }

    try {
      await saveCourse.mutateAsync(payload);
      Alert.alert('Curso salvo', editing ? 'Curso atualizado com sucesso.' : 'Curso publicado com sucesso.');
      resetForm();
    } catch (error) {
      Alert.alert('Falha ao salvar', getApiErrorMessage(error));
    }
  };

  const handleDelete = (curso: Curso) => {
    Alert.alert('Excluir curso?', `O curso "${curso.titulo}" sera removido do catalogo.`, [
      { style: 'cancel', text: 'Cancelar' },
      {
        style: 'destructive',
        text: 'Excluir',
        onPress: async () => {
          try {
            await deleteCourse.mutateAsync(curso.id);
          } catch (error) {
            Alert.alert('Falha ao excluir', getApiErrorMessage(error));
          }
        },
      },
    ]);
  };

  const styles = StyleSheet.create({
    content: {
      padding: 16,
      paddingBottom: 28,
    },
    formBox: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      gap: 10,
      marginBottom: 16,
      padding: 14,
    },
    title: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: '900',
      marginBottom: 2,
    },
    input: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      color: colors.text,
      fontSize: 15,
      minHeight: 46,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    inputArea: {
      minHeight: 96,
      textAlignVertical: 'top',
    },
    row: {
      flexDirection: 'row',
      gap: 10,
    },
    half: {
      flex: 1,
    },
    aulaBox: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      gap: 8,
      padding: 12,
    },
    aulaHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    aulaTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
    },
    courseRow: {
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
    courseInfo: {
      flex: 1,
    },
    courseTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
      lineHeight: 20,
    },
    courseMeta: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 3,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
  });

  if (user?.role !== 'admin') {
    return (
      <Screen style={{ padding: 16 }}>
        <EmptyState
          description="Entre com uma conta administradora para criar, editar e remover cursos."
          icon="admin-panel-settings"
          title="Acesso restrito"
        />
      </Screen>
    );
  }

  if (courses.isLoading) return <LoadingState label="Carregando area administrativa..." />;
  if (courses.isError) {
    return <ErrorState message="Nao foi possivel carregar os cursos." onRetry={() => courses.refetch()} />;
  }

  return (
    <Screen>
      <FlatList
        contentContainerStyle={styles.content}
        data={publishedCourses}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            description="Publique o primeiro curso para liberar o catalogo aos alunos."
            icon="school"
            title="Nenhum curso cadastrado"
          />
        }
        ListHeaderComponent={
          <View style={styles.formBox}>
            <Text style={styles.title}>{editing ? 'Editar curso' : 'Novo curso'}</Text>
            <TextInput
              onChangeText={(titulo) => setForm((current) => ({ ...current, titulo }))}
              placeholder="Titulo do curso"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={form.titulo}
            />
            <TextInput
              multiline
              onChangeText={(descricao) => setForm((current) => ({ ...current, descricao }))}
              placeholder="Descricao do curso"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.inputArea]}
              value={form.descricao}
            />
            <TextInput
              onChangeText={(instrutor) => setForm((current) => ({ ...current, instrutor }))}
              placeholder="Instrutor"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={form.instrutor}
            />
            <View style={styles.row}>
              <TextInput
                keyboardType="numeric"
                onChangeText={(cargaHoraria) => setForm((current) => ({ ...current, cargaHoraria }))}
                placeholder="Horas"
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.half]}
                value={form.cargaHoraria}
              />
              <TextInput
                onChangeText={(nivel) => setForm((current) => ({ ...current, nivel }))}
                placeholder="Nivel"
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.half]}
                value={form.nivel}
              />
            </View>
            <TextInput
              onChangeText={(categoria) => setForm((current) => ({ ...current, categoria }))}
              placeholder="Categoria"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={form.categoria}
            />

            <Text style={styles.title}>Aulas</Text>
            {form.aulas.map((aula, index) => (
              <View key={`${aula.id || 'nova'}-${index}`} style={styles.aulaBox}>
                <View style={styles.aulaHeader}>
                  <Text style={styles.aulaTitle}>Aula {index + 1}</Text>
                  {form.aulas.length > 1 ? (
                    <TouchableOpacity onPress={() => removeAula(index)}>
                      <MaterialIcons name="delete" size={22} color={colors.danger} />
                    </TouchableOpacity>
                  ) : null}
                </View>
                <TextInput
                  onChangeText={(titulo) => updateAula(index, { titulo })}
                  placeholder="Titulo da aula"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={aula.titulo}
                />
                <TextInput
                  keyboardType="numeric"
                  onChangeText={(duracao) => updateAula(index, { duracaoMinutos: Number(duracao) || 0 })}
                  placeholder="Duracao em minutos"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={String(aula.duracaoMinutos || '')}
                />
                <TextInput
                  multiline
                  onChangeText={(conteudo) => updateAula(index, { conteudo })}
                  placeholder="Conteudo completo da aula"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.inputArea]}
                  value={aula.conteudo}
                />
              </View>
            ))}

            <PrimaryButton icon="add" label="Adicionar aula" onPress={addAula} variant="secondary" />
            <PrimaryButton
              icon="save"
              label={editing ? 'Salvar alteracoes' : 'Publicar curso'}
              loading={saveCourse.isPending}
              onPress={handleSave}
            />
            {editing ? (
              <PrimaryButton icon="close" label="Cancelar edicao" onPress={resetForm} variant="secondary" />
            ) : null}
          </View>
        }
        onRefresh={courses.refetch}
        refreshing={courses.isRefetching}
        renderItem={({ item }) => (
          <View style={styles.courseRow}>
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{item.titulo}</Text>
              <Text style={styles.courseMeta}>
                {item.aulas.length} aulas - {item.cargaHoraria}h - {item.categoria}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => startEdit(item)}>
                <MaterialIcons name="edit" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <MaterialIcons name="delete" size={24} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}
