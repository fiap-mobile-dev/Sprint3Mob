# OracleLearn - Entrega Final Mobile

OracleLearn e uma plataforma mobile de treinamentos corporativos feita em React Native com Expo. O app permite que alunos consultem cursos, realizem matricula, acompanhem progresso por aula, recebam notificacoes contextuais e emitam certificados automaticamente ao concluir uma trilha. Administradores conseguem criar, editar e remover cursos e aulas pelo proprio aplicativo.

## Funcionalidades entregues

- Autenticacao com JWT, sessao persistida e protecao de rotas.
- Catalogo de cursos vindo da API, com cursos reais do freeCodeCamp, busca, detalhes, aulas e progresso.
- Matricula real em cursos e conclusao de aulas com atualizacao imediata da interface.
- Dashboard com dados derivados pela API: cursos disponiveis, matriculas, aulas concluidas, horas concluidas e certificados.
- Certificados gerados automaticamente quando todas as aulas do curso sao concluidas.
- Area administrativa com CRUD completo de cursos e aulas.
- Notificacoes locais relacionadas ao fluxo do produto: matricula, aula concluida e certificado emitido.
- Tema claro/escuro persistido no dispositivo.
- Tela "Sobre o app" com versao, hash do commit publicado, API configurada e integrantes.

## Estrutura

- `app-mobile`: aplicativo Expo/React Native e API REST local do OracleLearn.
- `app-mobile/api/src/freecodecamp.js`: integracao GraphQL com o curriculo publico do freeCodeCamp.
- `app-mobile/src/services`: camada de acesso a API e notificacoes.
- `app-mobile/src/hooks`: hooks de dados com TanStack Query.
- `app-mobile/src/components`: componentes reutilizaveis de interface.
- `app-mobile/app`: rotas e telas do Expo Router.

## Contas de demonstracao

Administrador:

```text
admin@oraclelearn.com
Admin@123
```

Aluno:

```text
aluno@oraclelearn.com
Aluno@123
```

## Execucao local

Instale e rode a API local:

```bash
cd app-mobile
npm run api:install
npm run api:start
```

Em outro terminal, rode o app:

```bash
cd app-mobile
npm install
npx expo start
```

Tambem e possivel iniciar a API diretamente:

```bash
cd app-mobile/api
npm install
npm start
```

Por padrao o app usa `http://localhost:3000/api`. No emulador Android, o app troca automaticamente `localhost` por `10.0.2.2`.

Para apontar para uma API publicada:

```bash
cd app-mobile
set EXPO_PUBLIC_API_URL=https://sua-api-publicada.com/api
npx expo start
```

## Publicacao

1. Publique a API de `app-mobile/api` em um provedor externo com o comando `npm start` e configure `JWT_SECRET`.
2. Confirme que `GET /api/health` responde publicamente.
3. No app, configure `EXPO_PUBLIC_API_URL` com a URL publica da API.
4. Gere a build interna Android:

```bash
cd app-mobile
eas build -p android --profile preview
```

5. Publique o APK gerado no Firebase App Distribution.
6. Adicione o e-mail institucional do professor como tester.
7. Abra o app publicado, entre em Perfil > Sobre o app e confira se o hash exibido corresponde ao commit entregue.

## Roteiro recomendado para o video

1. Mostrar login sem campos pre-preenchidos.
2. Entrar como aluno e abrir o dashboard.
3. Abrir Catalogo, escolher um curso e realizar matricula.
4. Mostrar a notificacao local de matricula.
5. Abrir uma aula, marcar como concluida e mostrar progresso atualizado.
6. Concluir todas as aulas de um curso e mostrar certificado/notificacao.
7. Entrar como administrador, criar ou editar um curso e mostrar o catalogo refletindo a alteracao.
8. Abrir Perfil > Sobre o app e mostrar versao/hash da build.

## Observacao sobre integracao

A versao final usa uma API REST propria publicada separadamente do app. Essa API enriquece o catalogo consultando a Curriculum GraphQL API publica do freeCodeCamp e mantem progresso, matriculas, certificados e cursos administrativos no OracleLearn. Para avaliacao em dispositivo fisico ou Firebase App Distribution, o aplicativo precisa apontar para uma URL publica em `EXPO_PUBLIC_API_URL`; `localhost` funciona apenas no ambiente de desenvolvimento.
