'use client'

import { UserProps } from "@/src/domain/entities/user"
import { createContext, useContext, ReactNode } from "react"

interface AuthContextProps {
  user: UserProps | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps)

export function AuthProvider({
  children,
  user
}: {
  children: ReactNode
  user: UserProps | null
}) {
  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.admin === 1,
        isSuperAdmin: user?.superadmin === 1
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
