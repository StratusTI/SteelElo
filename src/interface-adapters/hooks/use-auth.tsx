// src/interface-adapters/hooks/use-auth.tsx

'use client'

import { UserProps } from "@/src/domain/entities/user"
import { createContext, ReactNode, useContext } from "react"

interface AuthContextProps {
  user: UserProps | null
  isAdmin: boolean
  isSuperAdmin: boolean
  nomeCompleto: string
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
        isAdmin: user?.admin === true,
        isSuperAdmin: user?.superadmin === true,
        nomeCompleto: user ? `${user.nome} ${user.sobrenome}`.trim() : ''
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
