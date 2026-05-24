const bcrypt = require('bcryptjs');

const now = new Date().toISOString();

function passwordHash(password) {
  return bcrypt.hashSync(password, 10);
}

const cursos = [
  {
    id: 'curso-oci',
    titulo: 'Oracle Cloud Infrastructure (OCI)',
    descricao:
      'Capacitacao pratica para entender os principais servicos de nuvem da Oracle e aplicar conceitos de infraestrutura escalavel.',
    instrutor: 'Manoel Carvalho',
    cargaHoraria: 40,
    nivel: 'Fundamentos',
    categoria: 'Cloud',
    status: 'published',
    source: 'local',
    aulas: [
      {
        id: 'aula-oci-1',
        titulo: 'Fundamentos de computacao em nuvem',
        duracaoMinutos: 35,
        conteudo:
          'Computacao em nuvem permite consumir infraestrutura sob demanda, pagando pelo uso e reduzindo a necessidade de servidores fisicos proprios. Na OCI, esse modelo combina redes virtuais, computacao, armazenamento e banco de dados gerenciados para montar ambientes seguros e escalaveis.',
      },
      {
        id: 'aula-oci-2',
        titulo: 'VCN, sub-redes e seguranca',
        duracaoMinutos: 45,
        conteudo:
          'A Virtual Cloud Network organiza a comunicacao entre recursos da nuvem. Sub-redes publicas recebem componentes expostos, enquanto sub-redes privadas protegem bancos e servicos internos. Listas de seguranca e tabelas de rota definem quem pode acessar cada parte do ambiente.',
      },
      {
        id: 'aula-oci-3',
        titulo: 'Compute, storage e banco autonomo',
        duracaoMinutos: 50,
        conteudo:
          'Instancias de compute executam aplicacoes, volumes persistem dados e o Autonomous Database automatiza tarefas operacionais como patch, backup, tuning e recuperacao. O objetivo e reduzir operacao manual e aumentar disponibilidade.',
      },
    ],
  },
  {
    id: 'curso-spring',
    titulo: 'Java Spring Boot 3 na pratica',
    descricao:
      'Construcao de APIs REST com Spring Boot, persistencia, validacao e boas praticas de organizacao de camadas.',
    instrutor: 'Carlos Silva Borges',
    cargaHoraria: 60,
    nivel: 'Intermediario',
    categoria: 'Backend',
    status: 'published',
    source: 'local',
    aulas: [
      {
        id: 'aula-spring-1',
        titulo: 'Injecao de dependencias',
        duracaoMinutos: 40,
        conteudo:
          'O container do Spring cria e injeta componentes para reduzir acoplamento. Services concentram regras de negocio, repositories cuidam da persistencia e controllers recebem as requisicoes HTTP.',
      },
      {
        id: 'aula-spring-2',
        titulo: 'Controllers REST e validacao',
        duracaoMinutos: 55,
        conteudo:
          'Controllers transformam entradas HTTP em chamadas de negocio. DTOs e validadores garantem que a API receba dados consistentes antes de executar operacoes de criacao, atualizacao ou consulta.',
      },
      {
        id: 'aula-spring-3',
        titulo: 'Persistencia com Spring Data JPA',
        duracaoMinutos: 60,
        conteudo:
          'Spring Data JPA reduz codigo repetitivo de acesso a dados. Interfaces repository fornecem operacoes comuns e consultas derivadas, mantendo a camada de negocio mais legivel.',
      },
    ],
  },
  {
    id: 'curso-arquitetura',
    titulo: 'Fundamentos de arquitetura de software',
    descricao:
      'Conceitos de arquitetura evolutiva, microsservicos, mensageria, resiliencia e manutencao de sistemas reais.',
    instrutor: 'Gabriel Oliveira',
    cargaHoraria: 80,
    nivel: 'Avancado',
    categoria: 'Arquitetura',
    status: 'published',
    source: 'local',
    aulas: [
      {
        id: 'aula-arq-1',
        titulo: 'Monolito, modularidade e microsservicos',
        duracaoMinutos: 50,
        conteudo:
          'Arquitetura nao e sobre usar a tecnologia mais complexa, e sobre escolher limites claros. Monolitos modulares podem ser excelentes, enquanto microsservicos exigem observabilidade, contratos e maturidade operacional.',
      },
      {
        id: 'aula-arq-2',
        titulo: 'Mensageria e eventos',
        duracaoMinutos: 50,
        conteudo:
          'Mensageria desacopla fluxos e permite que tarefas continuem mesmo quando um sistema consumidor esta indisponivel. Eventos tornam o processamento assincrono e ajudam a escalar processos de negocio.',
      },
      {
        id: 'aula-arq-3',
        titulo: 'Resiliencia e tolerancia a falhas',
        duracaoMinutos: 45,
        conteudo:
          'Timeouts, circuit breakers, retries controlados e isolamento de recursos impedem que falhas pequenas se transformem em indisponibilidade total. Sistemas maduros sao desenhados assumindo que falhas vao acontecer.',
      },
    ],
  },
  {
    id: 'curso-devops',
    titulo: 'DevOps: pipeline de producao',
    descricao:
      'Do controle de versao ate CI/CD, containers, ambientes de homologacao e entrega continua com seguranca.',
    instrutor: 'Lucas Fernando',
    cargaHoraria: 50,
    nivel: 'Intermediario',
    categoria: 'DevOps',
    status: 'published',
    source: 'local',
    aulas: [
      {
        id: 'aula-devops-1',
        titulo: 'Containers e padronizacao de ambiente',
        duracaoMinutos: 45,
        conteudo:
          'Containers empacotam aplicacao e dependencias para reduzir diferencas entre maquina local, homologacao e producao. Imagens versionadas tornam a entrega mais previsivel.',
      },
      {
        id: 'aula-devops-2',
        titulo: 'Integracao continua',
        duracaoMinutos: 40,
        conteudo:
          'Pipelines de CI executam instalacao, lint, testes e build a cada alteracao. O objetivo e detectar erro cedo e impedir que codigo quebrado avance para ambientes compartilhados.',
      },
    ],
  },
];

function createSeedData() {
  return {
    users: [
      {
        id: 'usr-admin',
        name: 'Administrador OracleLearn',
        username: 'admin',
        email: 'admin@oraclelearn.com',
        passwordHash: passwordHash('Admin@123'),
        role: 'admin',
        createdAt: now,
      },
      {
        id: 'usr-aluno',
        name: 'Aluno Avaliador',
        username: 'aluno',
        email: 'aluno@oraclelearn.com',
        passwordHash: passwordHash('Aluno@123'),
        role: 'student',
        createdAt: now,
      },
    ],
    cursos,
    matriculas: [
      {
        id: 'mat-demo-oci',
        userId: 'usr-aluno',
        cursoId: 'curso-oci',
        status: 'active',
        aulasConcluidas: ['aula-oci-1'],
        createdAt: now,
        updatedAt: now,
      },
    ],
    certificados: [],
  };
}

module.exports = { createSeedData };
