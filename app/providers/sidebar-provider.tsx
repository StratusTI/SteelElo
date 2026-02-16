'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sidebar');
    if (stored !== null) setIsOpen(stored === 'true');
  }, []);

  const toggle = () => {
    setIsOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem('sidebar', String(newValue));
      return newValue;
    });
  };

  const open = () => {
    setIsOpen(true);
    localStorage.setItem('sidebar', 'true');
  };

  const close = () => {
    setIsOpen(false);
    localStorage.setItem('sidebar', 'false');
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggle,
        open,
        close,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSideBar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
