import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/api';

interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const token = await AsyncStorage.getItem('@oraclelearn_token');
      
      if (token) {
        try {
          const response = await api.get('/me');
          setUser(response.data.user);
        } catch (error) {
          await AsyncStorage.removeItem('@oraclelearn_token');
        }
      }
      setLoading(false);
    }
    loadStorageData();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const response = await api.post('/login', { username, password });
      
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('@oraclelearn_token', token);
      setUser(user);
    } catch (error) {
      throw new Error('Credenciais inválidas');
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@oraclelearn_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
