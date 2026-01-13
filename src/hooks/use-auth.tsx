'use client'

import { createContext, ReactNode, useContext } from "react"
import { User } from "../@types/user"
import { getUserFullName, isUserAdmin, isUserSuperAdmin } from "../utils/user"

interface AuthContextProps {
  user: User | null
  isAdmin: boolean
  isSuperAdmin: boolean
  nomeCompleto: string
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps)

export function AuthProvider({
  children,
  user
}: {
  children: ReactNode,
  user: User | null
}) {
  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user ? isUserAdmin(user) : false,
        isSuperAdmin: user ? isUserSuperAdmin(user) : false,
        nomeCompleto: user ? getUserFullName(user) : ''
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
