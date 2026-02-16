import { redirect } from 'next/navigation'
import { cache } from 'react'
import {
  getAuthUser as getAuthUserFromModule,
  getFullUserProfile,
  type AuthUser,
} from '@/src/auth'
import type { User } from '@/src/@types/user'
import {
  getUserFullName,
  isUserAdmin,
  isUserSuperAdmin,
  getUserInitials,
} from '@/src/utils/user'

const LOGIN_URL = '/login'

export interface AuthContext {
  user: User
  authUser: AuthUser
  fullName: string
  isAdmin: boolean
  isSuperAdmin: boolean
  initials: string
}

// Cache getAuthUser para deduplicar chamadas durante uma requisição
const getAuthUserCached = cache(async (): Promise<AuthUser | null> => {
  try {
    return await getAuthUserFromModule()
  } catch (error) {
    console.error('[getAuthUser] Error:', error)
    return null
  }
})

export async function getAuthUser(): Promise<AuthUser | null> {
  return getAuthUserCached()
}

// Cache toda a função requireAuth para deduplicar chamadas durante uma requisição
// Isso garante que múltiplas chamadas a requireAuth() na mesma requisição
// retornem o mesmo resultado sem fazer queries duplicadas ao banco
export const requireAuth = cache(async (): Promise<AuthContext> => {
  const authUser = await getAuthUserCached()

  if (!authUser) {
    // Verifica se tem refresh token para tentar renovar
    const { getAuthTokens } = await import('@/src/auth/cookies')
    const { refreshToken } = await getAuthTokens()

    if (refreshToken) {
      // Redireciona para endpoint de refresh
      redirect('/api/auth/refresh?returnTo=/')
    }

    // Não tem token válido, vai para login
    redirect(LOGIN_URL)
  }

  const user = await getFullUserProfile(authUser)

  if (!user) {
    redirect(LOGIN_URL)
  }

  return {
    user,
    authUser,
    fullName: getUserFullName(user),
    isAdmin: isUserAdmin(user),
    isSuperAdmin: isUserSuperAdmin(user),
    initials: getUserInitials(user),
  }
})

export async function requireAdminAuth(): Promise<AuthContext> {
  const auth = await requireAuth()

  if (!auth.isAdmin) {
    const defaultEnterpriseId = Array.isArray(auth.user.idempresa)
      ? auth.user.idempresa[0]
      : auth.user.idempresa
    redirect(`/${defaultEnterpriseId}/projects`)
  }

  return auth
}

export async function requireSuperAdminAuth(): Promise<AuthContext> {
  const auth = await requireAuth()

  if (!auth.isSuperAdmin) {
    const defaultEnterpriseId = Array.isArray(auth.user.idempresa)
      ? auth.user.idempresa[0]
      : auth.user.idempresa
    redirect(`/${defaultEnterpriseId}/projects`)
  }

  return auth
}
