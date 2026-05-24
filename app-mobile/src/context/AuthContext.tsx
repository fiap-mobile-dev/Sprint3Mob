import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../services/http';
import {
  loadCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '../services/authService';
import { User } from '../types/domain';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (login: string, password: string) => Promise<void>;
  signUp: (name: string, login: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        setUser(await loadCurrentUser());
      } catch {
        await logoutRequest();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  const value = useMemo<AuthContextData>(
    () => ({
      user,
      loading,
      signIn: async (login, password) => {
        try {
          setUser(await loginRequest(login, password));
        } catch (error) {
          throw new Error(getApiErrorMessage(error, 'Credenciais invalidas.'));
        }
      },
      signUp: async (name, login, password) => {
        try {
          setUser(await registerRequest(name, login, password));
        } catch (error) {
          throw new Error(getApiErrorMessage(error, 'Nao foi possivel criar a conta.'));
        }
      },
      signOut: async () => {
        await logoutRequest();
        setUser(null);
      },
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
