export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Aula {
  id: string;
  titulo: string;
  conteudo: string;
  duracaoMinutos: number;
  ordem?: number;
  totalDesafios?: number;
  source?: 'local' | 'freecodecamp';
  sourceBlock?: string;
  sourceBlockDashedName?: string;
  externalId?: string;
  externalUrl?: string | null;
}

export interface Certificado {
  id: string;
  userId: string;
  cursoId: string;
  cursoTitulo: string;
  cargaHoraria: number;
  issuedAt: string;
  codigo: string;
}

export interface ProgressoCurso {
  matriculado: boolean;
  matriculaId: string | null;
  status: 'available' | 'active' | 'completed';
  totalAulas: number;
  aulasConcluidas: number;
  aulasConcluidasIds: string[];
  percentual: number;
  horasConcluidas: number;
  proximaAulaId: string | null;
  certificadoEmitido: boolean;
  certificado: Certificado | null;
}

export interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  instrutor: string;
  cargaHoraria: number;
  nivel: string;
  categoria: string;
  status: 'published' | 'archived';
  source?: 'local' | 'freecodecamp';
  externalUrl?: string | null;
  aulas: Aula[];
  progresso?: ProgressoCurso;
}

export interface Dashboard {
  resumo: {
    cursosDisponiveis: number;
    cursosMatriculados: number;
    aulasConcluidas: number;
    horasConcluidas: number;
    certificadosEmitidos: number;
  };
  continuar: Curso | null;
  certificadosRecentes: Certificado[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CourseProgressResponse {
  aula?: Aula;
  progresso: ProgressoCurso;
  certificado: Certificado | null;
}

export interface LessonResponse {
  curso: Curso;
  aula: Aula;
}
