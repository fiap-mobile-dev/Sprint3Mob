const { execSync } = require('child_process');

function getCommitHash() {
  if (process.env.EXPO_PUBLIC_COMMIT_HASH) {
    return process.env.EXPO_PUBLIC_COMMIT_HASH;
  }

  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch (_error) {
    return 'local-dev';
  }
}

module.exports = ({ config }) => ({
  ...config,
  name: 'OracleLearn',
  slug: 'oraclelearn',
  scheme: 'oraclelearn',
  android: {
    ...(config.android || {}),
    package: 'com.guuhh12.oraclelearn',
  },
  extra: {
    ...(config.extra || {}),
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
    commitHash: getCommitHash(),
  },
});
