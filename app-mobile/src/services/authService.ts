import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, User } from '../types/domain';
import { api, TOKEN_STORAGE_KEY } from './http';

export async function login(loginValue: string, password: string) {
  const response = await api.post<AuthResponse>('/auth/login', {
    login: loginValue,
    password,
  });
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
  return response.data.user;
}

export async function register(name: string, loginValue: string, password: string) {
  const normalized = loginValue.trim().toLowerCase();
  const response = await api.post<AuthResponse>('/auth/register', {
    name,
    email: normalized.includes('@') ? normalized : undefined,
    username: normalized.includes('@') ? undefined : normalized,
    password,
  });
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
  return response.data.user;
}

export async function loadCurrentUser() {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    return null;
  }

  const response = await api.get<{ user: User }>('/me');
  return response.data.user;
}

export async function logout() {
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
}
