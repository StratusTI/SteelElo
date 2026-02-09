'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { User } from '@/src/@types/user';

interface EnterpriseContextType {
  enterpriseId: number;
  user: User;
  fullName: string;
  initials: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const EnterpriseContext = createContext<EnterpriseContextType | null>(null);

interface EnterpriseProviderProps {
  children: ReactNode;
  enterpriseId: number;
  user: User;
  fullName: string;
  initials: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function EnterpriseProvider({
  children,
  enterpriseId,
  user,
  fullName,
  initials,
  isAdmin,
  isSuperAdmin,
}: EnterpriseProviderProps) {
  // Memoizar o value para evitar re-renders desnecessários em componentes filhos
  const value = useMemo(
    () => ({
      enterpriseId,
      user,
      fullName,
      initials,
      isAdmin,
      isSuperAdmin,
    }),
    [enterpriseId, user, fullName, initials, isAdmin, isSuperAdmin],
  );

  return (
    <EnterpriseContext.Provider value={value}>
      {children}
    </EnterpriseContext.Provider>
  );
}

export function useEnterprise() {
  const context = useContext(EnterpriseContext);
  if (!context) {
    throw new Error('useEnterprise must be used within an EnterpriseProvider');
  }
  return context;
}

// Hook para acessar apenas o usuário (para compatibilidade)
export function useUser() {
  const { user, fullName, initials, isAdmin, isSuperAdmin } = useEnterprise();
  return { user, fullName, initials, isAdmin, isSuperAdmin };
}
