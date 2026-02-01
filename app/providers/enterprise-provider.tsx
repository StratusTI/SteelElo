'use client';

import { createContext, useContext, type ReactNode } from 'react';

interface EnterpriseContextType {
  enterpriseId: number;
}

const EnterpriseContext = createContext<EnterpriseContextType | null>(null);

interface EnterpriseProviderProps {
  children: ReactNode;
  enterpriseId: number;
}

export function EnterpriseProvider({
  children,
  enterpriseId,
}: EnterpriseProviderProps) {
  return (
    <EnterpriseContext.Provider value={{ enterpriseId }}>
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
