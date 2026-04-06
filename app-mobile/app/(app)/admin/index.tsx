import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/api/api';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

interface Aula { id?: number; titulo: string; conteudo: string; }
interface Curso { id: number; titulo: string; descricao: string; cargaHoraria: number; instrutor: string; aulas?: Aula[]; }

export default function AdminScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formulario, setFormulario] = useState<Partial<Curso>>({ aulas: [] });
  const [editando, setEditando] = useState<number | null>(null);

  const { data: cursos, isLoading } = useQuery<Curso[]>({
    queryKey: ['admin-cursos'],
    queryFn: async () => { const resp = await api.get('/cursos'); return resp.data; }
  });

  const mutationSalvar = useMutation({
    mutationFn: async (curso: Partial<Curso>) => {
      const cursoFinal = { ...curso, aulas: curso.aulas || [] };
      if (editando) await api.put(`/cursos/${editando}`, cursoFinal);
      else await api.post('/cursos', cursoFinal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cursos'] });
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      setFormulario({ aulas: [] });
      setEditando(null);
      Alert.alert('Sucesso', 'Curso salvo com sucesso!');
    },
    onError: () => Alert.alert('Erro', 'Falha ao salvar curso.')
  });

  const mutationExcluir = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/cursos/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cursos'] });
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    }
  });

  const addAula = () => {
    const novasAulas = [...(formulario.aulas || []), { titulo: '', conteudo: '' }];
    setFormulario({ ...formulario, aulas: novasAulas });
  };

  const editAula = (index: number, key: 'titulo' | 'conteudo', value: string) => {
    const novasAulas = [...(formulario.aulas || [])];
    novasAulas[index] = { ...novasAulas[index], [key]: value };
    setFormulario({ ...formulario, aulas: novasAulas });
  };

  const removeAula = (index: number) => {
    const novasAulas = [...(formulario.aulas || [])];
    novasAulas.splice(index, 1);
    setFormulario({ ...formulario, aulas: novasAulas });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    formBox: { backgroundColor: colors.card, padding: 16, borderRadius: 12, marginBottom: 16 },
    title: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 16 },
    input: { borderWidth: 1, borderColor: colors.border, color: colors.text, padding: 12, borderRadius: 8, marginBottom: 8 },
    inputArea: { height: 100, textAlignVertical: 'top' },
    aulaBox: { padding: 12, backgroundColor: colors.background, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    aulaTitleTop: { color: colors.text, fontWeight: 'bold', marginBottom: 8 },
    btnAddAula: { backgroundColor: colors.card, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', marginBottom: 16 },
    btnSalvar: { backgroundColor: colors.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: 'bold' },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: 12, marginBottom: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
    itemTitle: { color: colors.text, fontWeight: 'bold' },
    itemAulas: { fontSize: 12, opacity: 0.7, color: colors.text },
    actions: { flexDirection: 'row', gap: 12 }
  });

  if (user?.role !== 'admin') {
    return <View style={styles.container}><Text style={{ color: 'red' }}>Acesso Restrito a Administradores.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cursos}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <View style={styles.formBox}>
            <Text style={styles.title}>{editando ? 'Editar Curso' : 'Novo Curso'}</Text>
            <TextInput style={styles.input} placeholderTextColor={colors.border} placeholder="Título do Curso" value={formulario.titulo || ''} onChangeText={t => setFormulario({...formulario, titulo: t})} />
            <TextInput style={styles.input} placeholderTextColor={colors.border} placeholder="Descrição curta" value={formulario.descricao || ''} onChangeText={t => setFormulario({...formulario, descricao: t})} />
            <TextInput style={styles.input} placeholderTextColor={colors.border} placeholder="Nome do Instrutor" value={formulario.instrutor || ''} onChangeText={t => setFormulario({...formulario, instrutor: t})} />
            <TextInput style={styles.input} placeholderTextColor={colors.border} placeholder="Carga Horária Ex: 40" keyboardType="numeric" value={String(formulario.cargaHoraria || '')} onChangeText={t => setFormulario({...formulario, cargaHoraria: Number(t)})} />
            
            <Text style={[styles.title, { marginTop: 16, fontSize: 16 }]}>Módulos (Aulas de Texto)</Text>
            
            {formulario.aulas?.map((aula, index) => (
              <View key={index} style={styles.aulaBox}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Text style={styles.aulaTitleTop}>Aula {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeAula(index)}>
                    <MaterialIcons name="close" size={20} color="red" />
                  </TouchableOpacity>
                </View>
                <TextInput style={styles.input} placeholderTextColor={colors.border} placeholder="Título desta Aula" value={aula.titulo} onChangeText={t => editAula(index, 'titulo', t)} />
                <TextInput style={[styles.input, styles.inputArea]} placeholderTextColor={colors.border} placeholder="Conteúdo (Escreva a explicação completa da aula)" multiline value={aula.conteudo} onChangeText={t => editAula(index, 'conteudo', t)} />
              </View>
            ))}

            <TouchableOpacity style={styles.btnAddAula} onPress={addAula}>
              <Text style={{color: colors.primary, fontWeight: 'bold'}}>+ Adicionar Aula</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSalvar} onPress={() => mutationSalvar.mutate(formulario)} disabled={mutationSalvar.isPending}>
              {mutationSalvar.isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>SALVAR CURSO</Text>}
            </TouchableOpacity>
            
            {editando && (
              <TouchableOpacity onPress={() => {setEditando(null); setFormulario({aulas: []});}} style={{ marginTop: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.text }}>Cancelar Edição</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View>
              <Text style={styles.itemTitle}>{item.titulo}</Text>
              <Text style={styles.itemAulas}>{item.aulas?.length || 0} aulas cadastradas</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => { setEditando(item.id); setFormulario(item); }}>
                <MaterialIcons name="edit" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                Alert.alert('Excluir?', 'Tem certeza?', [
                  { text: 'Não' }, { text: 'Sim', onPress: () => mutationExcluir.mutate(item.id) }
                ])
              }}>
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
