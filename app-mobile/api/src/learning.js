function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

function publicCourse(curso) {
  return {
    id: curso.id,
    titulo: curso.titulo,
    descricao: curso.descricao,
    instrutor: curso.instrutor,
    cargaHoraria: curso.cargaHoraria,
    nivel: curso.nivel,
    categoria: curso.categoria,
    status: curso.status,
    source: curso.source || 'local',
    externalUrl: curso.externalUrl || null,
    aulas: curso.aulas || [],
  };
}

function getMatricula(data, userId, cursoId) {
  return data.matriculas.find(
    (matricula) => matricula.userId === userId && matricula.cursoId === cursoId
  );
}

function getCertificado(data, userId, cursoId) {
  return data.certificados.find(
    (certificado) => certificado.userId === userId && certificado.cursoId === cursoId
  );
}

function calculateProgress(data, userId, curso) {
  const aulas = curso.aulas || [];
  const matricula = getMatricula(data, userId, curso.id);
  const certificado = getCertificado(data, userId, curso.id);
  const aulasConcluidasIds = matricula?.aulasConcluidas || [];
  const totalAulas = aulas.length;
  const aulasConcluidas = aulas.filter((aula) => aulasConcluidasIds.includes(aula.id)).length;
  const percentual = totalAulas === 0 ? 0 : Math.round((aulasConcluidas / totalAulas) * 100);
  const proximaAula = aulas.find((aula) => !aulasConcluidasIds.includes(aula.id)) || null;

  return {
    matriculado: Boolean(matricula),
    matriculaId: matricula?.id || null,
    status: certificado ? 'completed' : matricula?.status || 'available',
    totalAulas,
    aulasConcluidas,
    aulasConcluidasIds,
    percentual,
    horasConcluidas: Math.round((curso.cargaHoraria || 0) * (percentual / 100)),
    proximaAulaId: proximaAula?.id || null,
    certificadoEmitido: Boolean(certificado),
    certificado: certificado || null,
  };
}

function buildDashboard(data, userId, catalogCourses = data.cursos) {
  const cursosPublicados = catalogCourses.filter((curso) => curso.status !== 'archived');
  const matriculas = data.matriculas.filter((matricula) => matricula.userId === userId);
  const certificados = data.certificados.filter((certificado) => certificado.userId === userId);
  const cursosComProgresso = cursosPublicados.map((curso) => ({
    ...publicCourse(curso),
    progresso: calculateProgress(data, userId, curso),
  }));
  const aulasConcluidas = cursosComProgresso.reduce(
    (total, curso) => total + curso.progresso.aulasConcluidas,
    0
  );
  const horasConcluidas = cursosComProgresso.reduce(
    (total, curso) => total + curso.progresso.horasConcluidas,
    0
  );
  const continuar = cursosComProgresso.find(
    (curso) => curso.progresso.matriculado && curso.progresso.percentual < 100
  );

  return {
    resumo: {
      cursosDisponiveis: cursosPublicados.length,
      cursosMatriculados: matriculas.length,
      aulasConcluidas,
      horasConcluidas,
      certificadosEmitidos: certificados.length,
    },
    continuar: continuar || null,
    certificadosRecentes: certificados.slice(-3).reverse(),
  };
}

function issueCertificateIfNeeded(data, userId, curso, progress) {
  if (!progress.matriculado || progress.percentual < 100) {
    return null;
  }

  const existing = getCertificado(data, userId, curso.id);
  if (existing) {
    return existing;
  }

  const issuedAt = new Date().toISOString();
  const certificado = {
    id: `cert-${userId}-${curso.id}`,
    userId,
    cursoId: curso.id,
    cursoTitulo: curso.titulo,
    cargaHoraria: curso.cargaHoraria,
    issuedAt,
    codigo: `OLEARN-${curso.id.replace('curso-', '').toUpperCase()}-${issuedAt.slice(0, 10).replaceAll('-', '')}`,
  };

  data.certificados.push(certificado);
  return certificado;
}

function sanitizeCoursePayload(payload, existingCourse = {}) {
  const aulas = Array.isArray(payload.aulas)
    ? payload.aulas
        .filter((aula) => aula.titulo && aula.conteudo)
        .map((aula, index) => ({
          id: aula.id || `aula-${Date.now().toString(36)}-${index}`,
          titulo: String(aula.titulo).trim(),
          conteudo: String(aula.conteudo).trim(),
          duracaoMinutos: Number(aula.duracaoMinutos) || 30,
          ordem: aula.ordem,
          totalDesafios: aula.totalDesafios,
          source: aula.source,
          sourceBlock: aula.sourceBlock,
          sourceBlockDashedName: aula.sourceBlockDashedName,
          externalId: aula.externalId,
          externalUrl: aula.externalUrl,
        }))
    : existingCourse.aulas || [];

  return {
    titulo: String(payload.titulo || existingCourse.titulo || '').trim(),
    descricao: String(payload.descricao || existingCourse.descricao || '').trim(),
    instrutor: String(payload.instrutor || existingCourse.instrutor || '').trim(),
    cargaHoraria: Number(payload.cargaHoraria || existingCourse.cargaHoraria || 0),
    nivel: String(payload.nivel || existingCourse.nivel || 'Fundamentos').trim(),
    categoria: String(payload.categoria || existingCourse.categoria || 'Geral').trim(),
    status: payload.status || existingCourse.status || 'published',
    source: existingCourse.source || 'local',
    aulas,
  };
}

function validateCourse(curso) {
  const errors = [];
  if (!curso.titulo) errors.push('Titulo do curso e obrigatorio.');
  if (!curso.descricao) errors.push('Descricao do curso e obrigatoria.');
  if (!curso.instrutor) errors.push('Instrutor e obrigatorio.');
  if (!curso.cargaHoraria || curso.cargaHoraria <= 0) errors.push('Carga horaria deve ser maior que zero.');
  if (!curso.aulas.length) errors.push('Cadastre pelo menos uma aula.');
  return errors;
}

module.exports = {
  buildDashboard,
  calculateProgress,
  issueCertificateIfNeeded,
  publicCourse,
  publicUser,
  sanitizeCoursePayload,
  validateCourse,
};
