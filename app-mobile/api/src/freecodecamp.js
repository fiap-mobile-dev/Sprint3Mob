const GRAPHQL_URL = 'https://curriculum-db.freecodecamp.org/graphql';
const RAW_CONTENT_URL =
  'https://raw.githubusercontent.com/freeCodeCamp/freeCodeCamp/main/curriculum/challenges/english/blocks';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const MAX_LESSONS_PER_COURSE = 60;

const FEATURED_SUPERBLOCKS = [
  'responsive-web-design',
  'javascript-algorithms-and-data-structures',
  'front-end-development-libraries',
  'data-visualization',
  'back-end-development-and-apis',
  'relational-databases',
  'scientific-computing-with-python',
  'data-analysis-with-python',
];

const COURSE_DETAILS = {
  'responsive-web-design': {
    descricao:
      'Curriculo oficial do freeCodeCamp para criar paginas responsivas com HTML, CSS, Flexbox, Grid e acessibilidade.',
    categoria: 'Frontend',
    nivel: 'Fundamentos',
    cargaHoraria: 300,
  },
  'javascript-algorithms-and-data-structures': {
    descricao:
      'Trilha real do freeCodeCamp para dominar JavaScript, estruturas de dados, pensamento algoritmico e resolucao de problemas.',
    categoria: 'JavaScript',
    nivel: 'Intermediario',
    cargaHoraria: 300,
  },
  'front-end-development-libraries': {
    descricao:
      'Curso com bibliotecas de front-end, componentes, estado, interfaces interativas e projetos de aplicacao web.',
    categoria: 'Frontend',
    nivel: 'Intermediario',
    cargaHoraria: 300,
  },
  'data-visualization': {
    descricao:
      'Formacao pratica para transformar dados em visualizacoes, graficos e dashboards usando bibliotecas modernas.',
    categoria: 'Dados',
    nivel: 'Intermediario',
    cargaHoraria: 300,
  },
  'back-end-development-and-apis': {
    descricao:
      'Curriculo de APIs, Node.js, Express, pacotes npm, servicos web e projetos de backend com dados persistentes.',
    categoria: 'Backend',
    nivel: 'Intermediario',
    cargaHoraria: 300,
  },
  'relational-databases': {
    descricao:
      'Curso de bancos relacionais com SQL, modelagem, consultas, PostgreSQL e automacao de tarefas com scripts.',
    categoria: 'Banco de dados',
    nivel: 'Fundamentos',
    cargaHoraria: 300,
  },
  'scientific-computing-with-python': {
    descricao:
      'Trilha para usar Python em problemas computacionais, automacao, manipulacao de dados e projetos praticos.',
    categoria: 'Python',
    nivel: 'Fundamentos',
    cargaHoraria: 300,
  },
  'data-analysis-with-python': {
    descricao:
      'Curriculo de analise de dados com Python, bibliotecas cientificas, limpeza de dados e visualizacoes.',
    categoria: 'Dados',
    nivel: 'Avancado',
    cargaHoraria: 300,
  },
};

let cachedCourses = null;
let cachedAt = 0;
const markdownCache = new Map();

async function fetchGraphQL(query, variables = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
    const payload = await response.json();

    if (!response.ok || payload.errors) {
      const message = payload.errors?.[0]?.message || 'Falha ao consultar o freeCodeCamp.';
      throw new Error(message);
    }

    return payload.data;
  } finally {
    clearTimeout(timeout);
  }
}

function plainSection(markdown, section) {
  const pattern = new RegExp(`# --${section}--\\n([\\s\\S]*?)(?=\\n# --|$)`, 'i');
  const match = markdown.match(pattern);
  return match?.[1]?.trim() || '';
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---[\s\S]*?---\s*/, '').trim();
}

function compactText(text, maxLength = 5000) {
  return text
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, maxLength)
    .trim();
}

function formatSection(title, body) {
  if (!body) return '';
  return `${title}\n${body.trim()}`;
}

function parseChallengeMarkdown(markdown, lesson) {
  const body = stripFrontmatter(markdown);
  const description = plainSection(body, 'description');
  const instructions = plainSection(body, 'instructions');
  const hints = plainSection(body, 'hints');
  const seed = plainSection(body, 'seed');

  const formattedHints = hints
    ? hints
        .split(/\n(?=[A-Z0-9].*?\n```)/)
        .slice(0, 4)
        .join('\n\n')
    : '';

  const seedPreview = seed
    ? seed
        .replace(/## --seed-contents--/g, 'Codigo inicial')
        .split('# --solutions--')[0]
        .trim()
    : '';

  return compactText(
    [
      `Aula oficial freeCodeCamp: ${lesson.titulo}`,
      `Modulo: ${lesson.sourceBlock}`,
      '',
      formatSection('Descricao', description),
      '',
      formatSection('Tarefa', instructions),
      '',
      formatSection('Criterios de validacao', formattedHints),
      '',
      formatSection('Material inicial', seedPreview),
      '',
      'Fonte: freeCodeCamp open-source curriculum.',
    ]
      .filter(Boolean)
      .join('\n')
  );
}

function fallbackLessonContent(lesson) {
  return [
    `Aula oficial freeCodeCamp: ${lesson.titulo}`,
    `Modulo: ${lesson.sourceBlock}`,
    '',
    'Esta aula faz parte do curriculo real do freeCodeCamp. O conteudo detalhado nao foi retornado no momento, mas a sequencia, titulo e modulo foram importados do catalogo publico.',
    '',
    'Objetivo',
    `Praticar o topico "${lesson.titulo}" dentro do modulo "${lesson.sourceBlock}".`,
    '',
    'Fonte: freeCodeCamp Curriculum GraphQL API.',
  ].join('\n');
}

async function fetchChallengeMarkdown(lesson) {
  if (!lesson.sourceBlockDashedName || !lesson.externalId) {
    return null;
  }

  const cacheKey = `${lesson.sourceBlockDashedName}/${lesson.externalId}`;
  if (markdownCache.has(cacheKey)) {
    return markdownCache.get(cacheKey);
  }

  const url = `${RAW_CONTENT_URL}/${lesson.sourceBlockDashedName}/${lesson.externalId}.md`;
  const response = await fetch(url);
  if (!response.ok) {
    markdownCache.set(cacheKey, null);
    return null;
  }

  const markdown = await response.text();
  markdownCache.set(cacheKey, markdown);
  return markdown;
}

async function enrichLessonContent(lesson) {
  if (lesson.source !== 'freecodecamp') {
    return lesson;
  }

  const markdown = await fetchChallengeMarkdown(lesson);
  return {
    ...lesson,
    conteudo: markdown ? parseChallengeMarkdown(markdown, lesson) : fallbackLessonContent(lesson),
  };
}

function mapSuperblockToCourse(superblock) {
  const details = COURSE_DETAILS[superblock.dashedName] || {};
  const aulas = [];

  (superblock.blockObjects || [])
    .filter((block) => block.challengeOrder?.length)
    .forEach((block) => {
      block.challengeOrder.forEach((challenge) => {
        if (aulas.length >= MAX_LESSONS_PER_COURSE) return;
        aulas.push({
          id: `fcc-${superblock.dashedName}-${challenge.id}`,
          titulo: challenge.title,
          conteudo: fallbackLessonContent({
            titulo: challenge.title,
            sourceBlock: block.name,
            source: 'freecodecamp',
          }),
          duracaoMinutos: 12,
          ordem: aulas.length + 1,
          totalDesafios: 1,
          source: 'freecodecamp',
          sourceBlock: block.name,
          sourceBlockDashedName: block.dashedName,
          externalId: challenge.id,
          externalUrl: `https://www.freecodecamp.org/learn/${superblock.dashedName}/${block.dashedName}/${challenge.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')}`,
        });
      });
    });

  return {
    id: `fcc-${superblock.dashedName}`,
    titulo: superblock.name,
    descricao: details.descricao || `Curso oficial do freeCodeCamp: ${superblock.name}.`,
    instrutor: 'freeCodeCamp',
    cargaHoraria: details.cargaHoraria || Math.max(40, aulas.length * 8),
    nivel: details.nivel || 'Intermediario',
    categoria: details.categoria || 'Tecnologia',
    status: 'published',
    source: 'freecodecamp',
    externalUrl: `https://www.freecodecamp.org/learn/${superblock.dashedName}/`,
    aulas,
  };
}

async function fetchFreeCodeCampCourses() {
  const query = `
    query CourseCatalog($dashedName: String!) {
      superblock(dashedName: $dashedName) {
        name
        dashedName
        isCertification
        blockObjects {
          name
          dashedName
          challengeOrder {
            id
            title
          }
        }
      }
    }
  `;

  const results = await Promise.all(
    FEATURED_SUPERBLOCKS.map((dashedName) => fetchGraphQL(query, { dashedName }))
  );

  return results
    .map((result) => result.superblock)
    .filter(Boolean)
    .map(mapSuperblockToCourse)
    .filter((course) => course.aulas.length);
}

async function getFreeCodeCampCourses() {
  const fresh = cachedCourses && Date.now() - cachedAt < CACHE_TTL_MS;
  if (fresh) {
    return cachedCourses;
  }

  cachedCourses = await fetchFreeCodeCampCourses();
  cachedAt = Date.now();
  return cachedCourses;
}

async function getFreeCodeCampCourse(courseId) {
  const courses = await getFreeCodeCampCourses();
  return courses.find((course) => course.id === courseId) || null;
}

async function getFreeCodeCampLesson(courseId, lessonId) {
  const course = await getFreeCodeCampCourse(courseId);
  const lesson = course?.aulas.find((item) => item.id === lessonId);

  if (!course || !lesson) {
    return null;
  }

  return {
    course,
    lesson: await enrichLessonContent(lesson),
  };
}

function clearFreeCodeCampCache() {
  cachedCourses = null;
  cachedAt = 0;
  markdownCache.clear();
}

module.exports = {
  clearFreeCodeCampCache,
  getFreeCodeCampCourse,
  getFreeCodeCampCourses,
  getFreeCodeCampLesson,
};
