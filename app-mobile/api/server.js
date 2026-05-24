const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createId, readData, writeData } = require('./src/store');
const {
  buildDashboard,
  calculateProgress,
  issueCertificateIfNeeded,
  publicCourse,
  publicUser,
  sanitizeCoursePayload,
  validateCourse,
} = require('./src/learning');
const {
  getFreeCodeCampCourse,
  getFreeCodeCampCourses,
  getFreeCodeCampLesson,
} = require('./src/freecodecamp');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'oracle_learn_dev_secret_change_me';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function signToken(user) {
  return jwt.sign(publicUser(user), SECRET_KEY, { expiresIn: '12h' });
}

function findUserByLogin(data, login) {
  const normalized = String(login || '').trim().toLowerCase();
  return data.users.find(
    (user) =>
      user.email.toLowerCase() === normalized ||
      user.username.toLowerCase() === normalized
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token nao fornecido.' });
  }

  const [, token] = authHeader.split(' ');
  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Sessao expirada. Entre novamente.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }
  next();
}

async function loadCatalogCourses(data) {
  const localCourses = data.cursos.filter((curso) => curso.status !== 'archived');

  try {
    const externalCourses = await getFreeCodeCampCourses();
    const localIds = new Set(localCourses.map((curso) => curso.id));
    return [
      ...externalCourses.filter((curso) => !localIds.has(curso.id)),
      ...localCourses,
    ];
  } catch (error) {
    console.warn(`Catalogo freeCodeCamp indisponivel: ${error.message}`);
    return localCourses;
  }
}

async function findCatalogCourse(data, courseId) {
  const localCourse = data.cursos.find((item) => item.id === courseId);
  if (localCourse) {
    return localCourse;
  }

  return getFreeCodeCampCourse(courseId);
}

function loginHandler(req, res) {
  const { login, username, email, password } = req.body;
  const data = readData();
  const user = findUserByLogin(data, login || email || username);

  if (!user || !bcrypt.compareSync(String(password || ''), user.passwordHash)) {
    return res.status(401).json({ error: 'Credenciais invalidas.' });
  }

  res.json({
    token: signToken(user),
    user: publicUser(user),
  });
}

function registerHandler(req, res) {
  const { name, username, email, password } = req.body;
  const data = readData();
  const login = email || username;

  if (!name || !login || !password) {
    return res.status(400).json({ error: 'Informe nome, e-mail/usuario e senha.' });
  }

  if (findUserByLogin(data, login)) {
    return res.status(409).json({ error: 'Ja existe uma conta com esse login.' });
  }

  const user = {
    id: createId('usr'),
    name: String(name).trim(),
    username: String(username || email).trim().toLowerCase(),
    email: String(email || `${username}@oraclelearn.local`).trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(String(password), 10),
    role: 'student',
    createdAt: new Date().toISOString(),
  };

  data.users.push(user);
  writeData(data);

  res.status(201).json({
    token: signToken(user),
    user: publicUser(user),
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'OracleLearn API' });
});

app.post('/api/login', loginHandler);
app.post('/api/auth/login', loginHandler);
app.post('/api/register', registerHandler);
app.post('/api/auth/register', registerHandler);

app.get('/api/me', authMiddleware, (req, res) => {
  const data = readData();
  const user = data.users.find((item) => item.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario nao encontrado.' });
  }
  res.json({ user: publicUser(user) });
});

app.get('/api/me/dashboard', authMiddleware, async (req, res) => {
  const data = readData();
  const catalogCourses = await loadCatalogCourses(data);
  res.json(buildDashboard(data, req.user.id, catalogCourses));
});

app.get('/api/cursos', authMiddleware, async (req, res) => {
  const data = readData();
  const catalogCourses = await loadCatalogCourses(data);
  const cursos = catalogCourses.map((curso) => ({
    ...publicCourse(curso),
    progresso: calculateProgress(data, req.user.id, curso),
  }));
  res.json(cursos);
});

app.get('/api/cursos/:id', authMiddleware, async (req, res) => {
  const data = readData();
  const curso = await findCatalogCourse(data, req.params.id);

  if (!curso || curso.status === 'archived') {
    return res.status(404).json({ error: 'Curso nao encontrado.' });
  }

  res.json({
    ...publicCourse(curso),
    progresso: calculateProgress(data, req.user.id, curso),
  });
});

app.get('/api/cursos/:id/aulas/:aulaId', authMiddleware, async (req, res) => {
  const data = readData();
  const curso = await findCatalogCourse(data, req.params.id);

  if (!curso || curso.status === 'archived') {
    return res.status(404).json({ error: 'Curso nao encontrado.' });
  }

  let aula = (curso.aulas || []).find((item) => item.id === req.params.aulaId);
  if (!aula) {
    return res.status(404).json({ error: 'Aula nao encontrada.' });
  }

  if (curso.source === 'freecodecamp') {
    const enriched = await getFreeCodeCampLesson(curso.id, aula.id);
    aula = enriched?.lesson || aula;
  }

  res.json({
    curso: {
      ...publicCourse(curso),
      progresso: calculateProgress(data, req.user.id, curso),
    },
    aula,
  });
});

app.post('/api/cursos/:id/matricular', authMiddleware, async (req, res) => {
  const data = readData();
  const curso = await findCatalogCourse(data, req.params.id);

  if (!curso || curso.status === 'archived') {
    return res.status(404).json({ error: 'Curso nao encontrado.' });
  }

  let matricula = data.matriculas.find(
    (item) => item.userId === req.user.id && item.cursoId === curso.id
  );

  if (!matricula) {
    matricula = {
      id: createId('mat'),
      userId: req.user.id,
      cursoId: curso.id,
      status: 'active',
      aulasConcluidas: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.matriculas.push(matricula);
    writeData(data);
  }

  res.status(201).json({
    matricula,
    progresso: calculateProgress(data, req.user.id, curso),
  });
});

app.post('/api/cursos/:id/aulas/:aulaId/concluir', authMiddleware, async (req, res) => {
  const data = readData();
  const curso = await findCatalogCourse(data, req.params.id);

  if (!curso || curso.status === 'archived') {
    return res.status(404).json({ error: 'Curso nao encontrado.' });
  }

  const aula = (curso.aulas || []).find((item) => item.id === req.params.aulaId);
  if (!aula) {
    return res.status(404).json({ error: 'Aula nao encontrada.' });
  }

  const matricula = data.matriculas.find(
    (item) => item.userId === req.user.id && item.cursoId === curso.id
  );
  if (!matricula) {
    return res.status(400).json({ error: 'Matricule-se no curso antes de concluir aulas.' });
  }

  if (!matricula.aulasConcluidas.includes(aula.id)) {
    matricula.aulasConcluidas.push(aula.id);
    matricula.updatedAt = new Date().toISOString();
  }

  let progresso = calculateProgress(data, req.user.id, curso);
  const certificado = issueCertificateIfNeeded(data, req.user.id, curso, progresso);
  progresso = calculateProgress(data, req.user.id, curso);
  writeData(data);

  res.json({
    aula,
    progresso,
    certificado,
  });
});

app.get('/api/certificados', authMiddleware, (req, res) => {
  const data = readData();
  const certificados = data.certificados
    .filter((certificado) => certificado.userId === req.user.id)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  res.json(certificados);
});

app.post('/api/cursos', authMiddleware, requireAdmin, (req, res) => {
  const data = readData();
  const cursoPayload = sanitizeCoursePayload(req.body);
  const errors = validateCourse(cursoPayload);

  if (errors.length) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  const curso = {
    id: createId('curso'),
    ...cursoPayload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.cursos.push(curso);
  writeData(data);
  res.status(201).json(publicCourse(curso));
});

app.put('/api/cursos/:id', authMiddleware, requireAdmin, (req, res) => {
  const data = readData();
  const index = data.cursos.findIndex((curso) => curso.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Curso nao encontrado.' });
  }

  const existingCourse = data.cursos[index];
  const cursoPayload = sanitizeCoursePayload(req.body, existingCourse);
  const errors = validateCourse(cursoPayload);

  if (errors.length) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  const updatedCourse = {
    ...existingCourse,
    ...cursoPayload,
    updatedAt: new Date().toISOString(),
  };
  data.cursos[index] = updatedCourse;

  const validLessonIds = updatedCourse.aulas.map((aula) => aula.id);
  data.matriculas
    .filter((matricula) => matricula.cursoId === updatedCourse.id)
    .forEach((matricula) => {
      matricula.aulasConcluidas = matricula.aulasConcluidas.filter((aulaId) =>
        validLessonIds.includes(aulaId)
      );
    });

  writeData(data);
  res.json(publicCourse(updatedCourse));
});

app.delete('/api/cursos/:id', authMiddleware, requireAdmin, (req, res) => {
  const data = readData();
  const curso = data.cursos.find((item) => item.id === req.params.id);

  if (!curso) {
    return res.status(404).json({ error: 'Curso nao encontrado.' });
  }

  data.cursos = data.cursos.filter((item) => item.id !== curso.id);
  data.matriculas = data.matriculas.filter((item) => item.cursoId !== curso.id);
  data.certificados = data.certificados.filter((item) => item.cursoId !== curso.id);
  writeData(data);

  res.json(publicCourse(curso));
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota nao encontrada.' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`OracleLearn API rodando na porta ${PORT}`);
});

module.exports = { app, server };
