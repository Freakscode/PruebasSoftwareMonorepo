import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiClient from '../api/axiosConfig';

interface User {
  id: number;
  nombre_completo: string;
  correo_electronico: string;
  es_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<{ user: User }>('/session');
        if (response.data && response.data.user) {
          setUser(response.data.user);
          console.log("Sesión activa encontrada:", response.data.user);
        } else {
          setUser(null);
        }
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
           console.log("No hay sesión activa.");
        } else {
           console.error("Error verificando sesión:", error);
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
        await apiClient.delete('/session');
        setUser(null);
        console.log("Sesión cerrada exitosamente en el servidor.");
        
    } catch (error) {
        console.error("Error al cerrar sesión en el servidor:", error);
        setUser(null);
    } finally {
        setIsLoading(false);
    }
  };

  const value = { user, isLoading, login, logout };

  if (isLoading && !user) {
     
     return <div>Verificando sesión...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
