# OracleLearn Mobile

Aplicativo Expo Router da plataforma OracleLearn.

## Principais comandos

```bash
npm install
npm run api:install
npm run api:start
npx expo start
npm run lint
npm run typecheck
npm run export:web
```

## Variaveis de ambiente

- `EXPO_PUBLIC_API_URL`: URL publica da API, terminando em `/api`.
- `EXPO_PUBLIC_COMMIT_HASH`: hash opcional usado na tela "Sobre o app". Se nao for informado, `app.config.js` tenta ler o hash atual do Git.

Exemplo em PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL="https://sua-api-publicada.com/api"
$env:EXPO_PUBLIC_COMMIT_HASH=(git rev-parse --short HEAD)
npx expo start
```

## Build interna Android

```bash
eas build -p android --profile preview
```

Depois da build, envie o APK para o Firebase App Distribution e cadastre o professor como tester.
