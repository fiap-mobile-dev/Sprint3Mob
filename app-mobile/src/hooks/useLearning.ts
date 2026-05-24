import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeLesson,
  CoursePayload,
  deleteCourse,
  enrollCourse,
  getCertificates,
  getCourse,
  getCourses,
  getDashboard,
  getLesson,
  saveCourse,
} from '../services/courseService';
import {
  notifyCertificate,
  notifyEnrollment,
  notifyLessonCompleted,
} from '../services/notificationService';

export const learningKeys = {
  dashboard: ['dashboard'] as const,
  courses: ['courses'] as const,
  course: (id?: string) => ['course', id] as const,
  lesson: (courseId?: string, lessonId?: string) => ['lesson', courseId, lessonId] as const,
  certificates: ['certificates'] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: learningKeys.dashboard,
    queryFn: getDashboard,
  });
}

export function useCourses() {
  return useQuery({
    queryKey: learningKeys.courses,
    queryFn: getCourses,
  });
}

export function useCourse(cursoId?: string) {
  return useQuery({
    queryKey: learningKeys.course(cursoId),
    queryFn: () => getCourse(String(cursoId)),
    enabled: Boolean(cursoId),
  });
}

export function useLesson(cursoId?: string, lessonId?: string) {
  return useQuery({
    queryKey: learningKeys.lesson(cursoId, lessonId),
    queryFn: () => getLesson(String(cursoId), String(lessonId)),
    enabled: Boolean(cursoId && lessonId),
  });
}

export function useCertificates() {
  return useQuery({
    queryKey: learningKeys.certificates,
    queryFn: getCertificates,
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cursoId }: { cursoId: string; cursoTitulo: string }) => enrollCourse(cursoId),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: learningKeys.dashboard }),
        queryClient.invalidateQueries({ queryKey: learningKeys.courses }),
        queryClient.invalidateQueries({ queryKey: learningKeys.course(variables.cursoId) }),
      ]);
      await notifyEnrollment(variables.cursoId, variables.cursoTitulo);
    },
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cursoId, aulaId }: { cursoId: string; aulaId: string; aulaTitulo: string; cursoTitulo: string }) =>
      completeLesson(cursoId, aulaId),
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: learningKeys.dashboard }),
        queryClient.invalidateQueries({ queryKey: learningKeys.courses }),
        queryClient.invalidateQueries({ queryKey: learningKeys.course(variables.cursoId) }),
        queryClient.invalidateQueries({ queryKey: learningKeys.certificates }),
      ]);

      if (data.certificado) {
        await notifyCertificate(variables.cursoId, variables.cursoTitulo);
        return;
      }

      await notifyLessonCompleted(variables.cursoId, variables.aulaTitulo, variables.cursoTitulo);
    },
  });
}

export function useSaveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (curso: CoursePayload) => saveCourse(curso),
    onSuccess: async (curso) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: learningKeys.dashboard }),
        queryClient.invalidateQueries({ queryKey: learningKeys.courses }),
        queryClient.invalidateQueries({ queryKey: learningKeys.course(curso.id) }),
      ]);
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cursoId: string) => deleteCourse(cursoId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: learningKeys.dashboard }),
        queryClient.invalidateQueries({ queryKey: learningKeys.courses }),
        queryClient.invalidateQueries({ queryKey: learningKeys.certificates }),
      ]);
    },
  });
}
