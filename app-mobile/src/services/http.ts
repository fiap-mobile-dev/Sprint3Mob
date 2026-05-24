import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const TOKEN_STORAGE_KEY = '@oraclelearn_token';

type RequestOptions = {
  body?: unknown;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function resolveBaseUrl() {
  const configuredUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

  if (configuredUrl.includes('localhost') || configuredUrl.includes('127.0.0.1')) {
    const expoHost = getExpoLanHost();
    if (expoHost) {
      return configuredUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1):?\d*/, `http://${expoHost}:3000`);
    }
  }

  if (Platform.OS === 'android' && configuredUrl.includes('localhost')) {
    return configuredUrl.replace('localhost', '10.0.2.2');
  }

  return configuredUrl;
}

function getExpoLanHost() {
  const constants = Constants as unknown as {
    expoConfig?: { hostUri?: string };
    manifest?: { debuggerHost?: string };
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  };

  const hostUri =
    constants.expoConfig?.hostUri ||
    constants.manifest2?.extra?.expoClient?.hostUri ||
    constants.manifest?.debuggerHost;
  const host = hostUri?.split(':')[0];

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }

  return host;
}

function buildUrl(path: string) {
  const baseUrl = resolveBaseUrl().replace(/\/$/, '');
  return `${baseUrl}${path}`;
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      method: options.method || 'GET',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Tempo esgotado ao conectar na API. Verifique se o servidor esta ligado e na mesma rede.', 408);
    }

    throw new ApiError('Nao foi possivel conectar na API. Confira a rede e a URL configurada.', 0);
  } finally {
    clearTimeout(timeout);
  }

  const rawBody = await response.text();
  const payload = rawBody ? JSON.parse(rawBody) : null;

  if (!response.ok) {
    throw new ApiError(payload?.error || payload?.message || 'Nao foi possivel concluir a operacao.', response.status);
  }

  return { data: payload as T };
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { body, method: 'POST' }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { body, method: 'PUT' }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export function getApiErrorMessage(error: unknown, fallback = 'Nao foi possivel concluir a operacao.') {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
