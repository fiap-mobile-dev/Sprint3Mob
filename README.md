# 📱 Plataforma OracleLearn (Sprint 3)

## 🎯 Descrição do Problema Escolhido
Companhias de tecnologia e estudantes enfrentam dificuldades na visibilidade, gestão e matrícula simplificada em treinamentos e módulos de capacitação. Informações sobre carga horária, instrutores e ementa costumam ficar descentralizadas ou em sistemas lentos, dificultando a escalabilidade do aprendizado corporativo.

## 💡 Descrição Geral da Solução Proposta
A nossa solução é um aplicativo Mobile nativo de treinamentos (OracleLearn) que centraliza os módulos educativos de um sistema. Desenvolvido para facilitar o lado do colaborador (visão de consumo e controle de horas) e também com robustez para administradores (Painel CRUD completo).

O aplicativo foi projetado priorizando:
1. A usabilidade e controle de Temas (Customização Claro/Escuro).
2. Fluxos Reais de Navegação.
3. Consumo integral via Requisições HTTP (com carregamentos instantâneos locais).

## 🛠 Tecnologias Utilizadas
- **Frontend Mobile:** React Native, Expo, Expo-Router (Para navegação).
- **Backend/Autenticação:** Node.js, Express, JSONWebToken (Micro-serviço rodando à parte apenas para validarmos o controle de sessões rigoroso).
- **Consumo de Rest APIs:** `@tanstack/react-query` (Gerenciamento assíncrono de estado e caching) e `axios`.
- **Persistência de Dados de Sessão:** `AsyncStorage`.
- **Banco de Dados Principal e API Base (Planejado/Utilizado):** Oracle APEX via ORDS (Endpoint da tabela de Cursos).

## 🚀 Instruções para Executar o Projeto Localmente

Lembre-se que este projeto contém duas partes para funcionar corretamente e sem mocks de código: O Servidor e o App.

### 1. Iniciar o Servidor de Autenticação
Dentro do terminal, acesse a pasta do backend e inicie-o:
```bash
cd backend-auth
npm install
node server.js
```
O servidor deverá ser hospedado na porta 3000 local.

### 2. Iniciar o Aplicativo Móvel (Frontend)
Abra um novo terminal (não feche o backend), acesse a pasta mobile e ative a biblioteca do Expo:
```bash
cd app-mobile
npm install
npx expo start -c
```
- Utilize as contas criadas e armazenadas no backend e navegue até a sessão de Admin para testar o CRUD nativo.
- As requisições são performadas pela API do TanStack Query, demonstrando *Spinners* de Loading assíncronos de resposta de rede reais.

---
**🔗 Vídeo de Apresentação (YouTube):** https://youtu.be/y9IQtIUzbno
