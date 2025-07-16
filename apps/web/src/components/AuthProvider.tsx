import React, { createContext, useContext } from 'react';
import type { User } from '@otaku-secretary/shared';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: () => {},
  login: () => {},
  logout: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
  value: AuthContextType;
}

export function AuthProvider({ children, value }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}