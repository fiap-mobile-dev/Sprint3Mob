import {
  Aula,
  CourseProgressResponse,
  Curso,
  Dashboard,
  Certificado,
  LessonResponse,
} from '../types/domain';
import { api } from './http';

export type CoursePayload = Partial<Omit<Curso, 'aulas' | 'progresso'>> & {
  aulas?: (Partial<Aula> & { titulo: string; conteudo: string })[];
};

export async function getDashboard() {
  const response = await api.get<Dashboard>('/me/dashboard');
  return response.data;
}

export async function getCourses() {
  const response = await api.get<Curso[]>('/cursos');
  return response.data;
}

export async function getCourse(cursoId: string) {
  const response = await api.get<Curso>(`/cursos/${cursoId}`);
  return response.data;
}

export async function getLesson(cursoId: string, aulaId: string) {
  const response = await api.get<LessonResponse>(`/cursos/${cursoId}/aulas/${aulaId}`);
  return response.data;
}

export async function enrollCourse(cursoId: string) {
  const response = await api.post<CourseProgressResponse>(`/cursos/${cursoId}/matricular`);
  return response.data;
}

export async function completeLesson(cursoId: string, aulaId: string) {
  const response = await api.post<CourseProgressResponse>(`/cursos/${cursoId}/aulas/${aulaId}/concluir`);
  return response.data;
}

export async function getCertificates() {
  const response = await api.get<Certificado[]>('/certificados');
  return response.data;
}

export async function saveCourse(curso: CoursePayload) {
  if (curso.id) {
    const response = await api.put<Curso>(`/cursos/${curso.id}`, curso);
    return response.data;
  }

  const response = await api.post<Curso>('/cursos', curso);
  return response.data;
}

export async function deleteCourse(cursoId: string) {
  const response = await api.delete<Curso>(`/cursos/${cursoId}`);
  return response.data;
}
