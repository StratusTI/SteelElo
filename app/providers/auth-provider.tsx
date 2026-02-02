import { createContext, type ReactNode, useContext } from 'react';
import type { User } from '@/src/@types/user';

interface AuthUser {
  user: User | null;
}

const AuthContext = createContext<AuthUser | null>(null);

export function AuthProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: AuthUser;
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
