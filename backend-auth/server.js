const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const SECRET_KEY = "oracle_learn_secret_key";
const users = [
  { id: 1, username: 'admin', password: '123', role: 'admin', name: 'Administrador' },
  { id: 2, username: 'aluno', password: '123', role: 'student', name: 'Aluno Padrão' }
];

let cursos = [
  { 
    id: 1, 
    titulo: 'Oracle Cloud Infrastructure (OCI)', 
    descricao: 'Fundamentos completos da tecnologia em nuvem da Oracle para escalabilidade empresarial. Aprenda IaaS, PaaS e SaaS.', 
    instrutor: 'Manoel Carvalho', 
    cargaHoraria: 40,
    aulas: [
      {
        id: 1,
        titulo: 'O que é Computação em Nuvem e OCI?',
        conteudo: 'A computação em nuvem muda a forma como organizações constroem arquiteturas. Em vez de comprar servidores que ficam ligados 24x7 no seu porão gerando calor, você aluga o processamento sob demanda.\n\nA Oracle Cloud Infrastructure (OCI) é uma nuvem de segunda geração, feita para altíssimo desempenho, com foco pesado em Bancos de Dados Autônomos e estabilidade máxima de rede.'
      },
      {
        id: 2,
        titulo: 'Entendendo VPCs (Virtual Cloud Networks)',
        conteudo: 'Tudo na nuvem precisa de uma rede virtual. A VCN é o coração da segurança da sua infraestrutura.\n\nVocê divide sua VCN em Subredes Públicas (onde fica o front-end aberto pra internet) e Subredes Privadas (onde seu banco de dados fica trancafiado e invisível pros hackers do lado de fora). As tabelas de roteamento dizem quem pode falar com quem.'
      },
      {
        id: 3,
        titulo: 'Compute Instances e Block Volumes',
        conteudo: 'Máquinas Virtuais (VMs) ou Bare Metal (físicas) representam o coração computacional da sua nuvem. Você sobe uma máquina ubuntu com 32 núcleos em questão de 45 segundos.\n\nBlock Volumes são discos rígidos que você anexa nessas máquinas. Eles sobrevivem à exclusão da máquina. Ou seja, se o servidor explodir, o HD virtual ainda está ali intacto e pode ser plugado em outro servidor.'
      },
      {
        id: 4,
        titulo: 'Autonomous Databases',
        conteudo: 'A grande revolução da Oracle. O Autonomous Database é um motor de banco de dados que faz patches sozinho, ajusta performance com IA rodando por trás, encripta tudo por padrão e até faz backup e recovery automático sem você precisar ter um DBA dedicado virando a noite.'
      }
    ]
  },
  { 
    id: 2, 
    titulo: 'Java Spring Boot 3 na Prática', 
    descricao: 'Da configuração inicial até a AWS. Domine Rest APIs, JPA, injeção de dependências e segurança.', 
    instrutor: 'Carlos Silva Borges', 
    cargaHoraria: 60,
    aulas: [
      {
        id: 1,
        titulo: 'Inversão de Controle e Injeção de Dependências',
        conteudo: 'Um dos corações do ecossistema Spring é o container de Injeção de Dependências. Em vez de você criar objetos usando o comando "new Classe()" e misturar dependências (acoplamento alto), você delega tudo pro Spring.\n\nCom anotações simples como @Component, @Service, o Spring instancia tudo e injeta pra você através do construtor.'
      },
      {
        id: 2,
        titulo: 'Padrão MVC com @RestController',
        conteudo: 'O Controller é a porta de entrada da sua API.\n\nUsando a anotação @RestController, você define endpoints HTTP de forma declarativa. @GetMapping("/usuarios"), mapeamentos de JSON automático usando a biblioteca Jackson por debaixo dos panos, e recebimento de parâmetros através de @PathVariable ou @RequestBody.'
      },
      {
        id: 3,
        titulo: 'Camada de Persistência com Spring Data JPA',
        conteudo: 'Fugindo do JDBC raiz. Com Spring Data JPA, você só cria uma interface vazia herdando `JpaRepository` e ganha todos os métodos prontos: save(), findById(), delete().\n\nAlém disso, você pode usar os Query Methods: "findByNameAndId(String name, Long id)" e o Hibernate escreve a SQL pra você.'
      }
    ]
  },
  { 
    id: 3, 
    titulo: 'Fundamentos de Arquitetura de Software', 
    descricao: 'Tópicos avançados sobre Microserviços, Mensageria, Bancos SQL vs NoSQL e Engenharia de Resiliência.', 
    instrutor: 'Gabriel Oliveira', 
    cargaHoraria: 120,
    aulas: [
      {
        id: 1,
        titulo: 'Monolito vs Microserviços',
        conteudo: 'Um monolito é um projeto onde tudo (vendas, estoque, pagamentos) compila junto num só ".exe". Se uma linha quebra, o servidor todo cai.\n\nMicroserviços quebram sua empresa em vários mini-sistemas que se comunicam via HTTP ou filas (Kafka, RabbitMQ). Eles ganham independência, mas trazem uma complexidade absurda na hora de rastrear bugs.'
      },
      {
        id: 2,
        titulo: 'Mensageria e Event Driven Architecture',
        conteudo: 'Comunicação síncrona (como requisições REST) falha quando o outro lado da linha cai. É aí que a Mensageria salva.\n\nAo finalizar uma compra, você não envia direto um HTTP pro departamento de envio. Você posta o evento "COMPRA CONCLUIDA" num broker como Apache Kafka. O módulo de envio vai consumir esse evento quando der conta, num processo totalmente assíncrono!'
      }
    ]
  },
  {
    id: 4, 
    titulo: 'DevOps: Pipeline de Produção', 
    descricao: 'Guia definitivo de Docker, Kubernetes e CI/CD para implantar software como gente grande.', 
    instrutor: 'Lucas Fernando', 
    cargaHoraria: 80,
    aulas: [
      {
        id: 1,
        titulo: 'Docker e o fim do "Na minha máquina funciona"',
        conteudo: 'Docker utiliza namespaces e cgroups do Kernel do linux para empacotar sua aplicação com tudo que ela precisa dentro (OS, binarios, nodeJS, python) num pacote chamado Contêiner. \n\nO que roda no seu PC Windows, vai rodar no Linux da Amazon de maneira estritamente idêntica.'
      },
      {
        id: 2,
        titulo: 'O que é Integração Contínua (CI)?',
        conteudo: 'O desenvolvedor faz o Push no Github. Imediatamente a nuvem (GitHub Actions) detecta a mudança e levanta uma máquina virtual provisória, roda toda a bateria de testes automatizados e retorna um check verde.\n\nIntegração Contínua impede que lixo caia em produção, porque os testes bloqueiam as mesclagens ruins.'
      }
    ]
  },
  {
    id: 5, 
    titulo: 'Clean Code na Veia', 
    descricao: 'A arte suprema de nomear variáveis, escrever funções puras e parar com o vício de deixar comentários.', 
    instrutor: 'Robertão da Esquina', 
    cargaHoraria: 20,
    aulas: [
      {
        id: 1,
        titulo: 'Nomes são tudo. Variáveis pequenas não!',
        conteudo: 'Ao invés de nomear algo "d", nomeie como "diasParaExpiracao". A quantidade de tempo que você perde tentando decifrar o código de outra pessoa (ou o seu de dois meses atrás) é gigante.\n\nSeja verboso, seja extremamente preciso. Nomes difíceis de pronunciar como "genYMdhms" levam embora a fluidez da comunicação no trabalho em equipe.'
      },
      {
        id: 2,
        titulo: 'Comentários são falhas do seu idioma de código',
        conteudo: 'O bom código se explica sozinho. Se você gastou 3 linhas explicando o que um If gigante faz, você falhou.\n\nUse o recurso de encapsular a lógica daquele If dentro de uma função super descritiva. `if (checarFuncionarioTemAcesso(id))`, pra quê eu preciso comentar no topo que o código checa o nível de segurança agora?'
      }
    ]
  }
];
let nextCursoId = 6;

const technicalDeepDive = `

### Aprofundamento Prático e Casos de Uso na Indústria

Para compreendermos verdadeiramente o impacto tecnológico destes conceitos, é necessário analisar as falhas catastróficas e os sucessos estrondosos que moldaram a moderna engenharia de software e a computação distribuída. A verdadeira resiliência de um sistema não se testa quando os gráficos monitorados estão estáticos e o fluxo de usuários é regular e projetado; ela se testa quando componentes imprevistos entram em cascata de colapso, quando datacenters perdem a refrigeração do ar-condicionado, ou quando requisições massivas oriundas de um pico sazonal invadem os balanceadores de carga com tráfego nunca antes modelado pela equipe de operações.

O conceito de Engenharia do Caos, altamente promovido por gigantes como a Netflix e a Amazon, é embasado precisamente nisso: sistemas maduros abraçam a aleatoriedade da falha porque as leis da física determinam que servidores são meras caixas metálicas propensas à deterioração por aquecimento, problemas de solda nos chips ou interrupções súbitas na rede de fibra óptica do oceano. Projetar a aplicação assumindo que a infraestrutura é perfeita é o caminho inaugural para as maiores quedas de bolsa de valores ou vazamentos de dados do último século.

Dessa maneira, a adoção destas metodologias obriga as equipes de TI a reverem o que significa "Tolerância a Falhas". Circuit Breakers começam a se tornar essenciais na comunicação entre microsserviços, assim como o isolamento de instâncias (Bulkheads). Se um contêiner Docker falha ao acessar o banco de dados que sofreu um ataque DDoS, não podemos deixar o pool de threads ficar congelado em infinitos timeouts aguardando o banco responder, pois em cinco segundos todas as requisições travarão e o servidor explodirá num esgotamento total de capacidade computacional (OOM - Out of Memory).

### Arquitetura Adaptável (Evolutionary Architecture)

À medida em que expandimos esses domínios, descobrimos que nada é vitalício. Componentes arquiteturais que eram venerados na década de 90, como arquiteturas EJB altamente acopladas, se tornaram pó nas vias modernas de comunicação rápida sobre WebSockets e gRPC. As arquiteturas precisam ser feitas com abstração o suficiente para permitirem que o banco de dados central seja substituído por um banco de grafos (NoSQL) nos próximos dois anos, sem que para isso a empresa precise parar o time por seis meses em uma refatoração assustadora que afunda todos os gráficos de entrega de valor comercial.

Sempre meça o código da perspectiva da "Síndrome de Decomposição". Quantas linhas terão de ser apagadas, e quais testes quebrarão, se no lugar de um banco SQL tradicional nós mudarmos o backend para consumir Filas de Eventos num cluster Kafka geodistribuído? Essa visão transforma a postura do desenvolvedor de apenas um programador para um Engenheiro de Software pleno.

### Considerações Finais sobre Governança e Código Limpo

A manutenção desse ecossistema caótico demanda código higiênico. A leitura é a atividade principal do programador (escrevemos 1 linha para cada 10 linhas que lemos de nós mesmos, tentando lembrar o porquê de termos declarado certa variável). Utilizar nomes de variáveis ultra encurtados, funções com efeitos colaterais e comentários desnecessários como suporte para justificar fluxos confusos acabam acelerando a Morte da Base de Código. Trabalhos excepcionais começam na fundação: variáveis claras, logs informativos e testes automatizados que realmente testam o limite do negócio e não apenas chamam código passivamente.

Em suma, as abordagens que delineamos durante esta documentação traçam um retrato imponente das exigências globais pelas quais você precisará se pautar quando estiver arquitetando sistemas para milhões de usuários simultâneos no futuro.
`;

cursos.forEach(curso => {
  if (curso.aulas) {
    curso.aulas.forEach(aula => {
      aula.conteudo = aula.conteudo + technicalDeepDive.repeat(2);
    });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '12h' });
  res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});

app.post('/api/register', (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Preencha usuário e senha' });
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'Usuário já existe' });
  
  const newUser = { id: users.length + 1, username, password, role: role || 'admin', name: name || username };
  users.push(newUser);
  res.status(201).json({ message: 'Conta criada' });
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/cursos', authMiddleware, (req, res) => {
  res.json(cursos);
});

app.get('/api/cursos/:id', authMiddleware, (req, res) => {
  const curso = cursos.find(c => c.id === parseInt(req.params.id));
  if (curso) res.json(curso);
  else res.status(404).json({ error: 'Curso não encontrado' });
});

app.post('/api/cursos', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
  
  const novoCurso = { id: nextCursoId++, ...req.body };
  cursos.push(novoCurso);
  res.status(201).json(novoCurso);
});

app.put('/api/cursos/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
  
  const index = cursos.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    cursos[index] = { ...cursos[index], ...req.body };
    res.json(cursos[index]);
  } else {
    res.status(404).json({ error: 'Curso não encontrado' });
  }
});

app.delete('/api/cursos/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
  
  const index = cursos.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    const deleted = cursos.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Curso não encontrado' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
