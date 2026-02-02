import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/src/utils/jwt'
import type { User } from '@/src/@types/user'
import {
  getUserFullName,
  isUserAdmin,
  isUserSuperAdmin,
  getUserInitials,
} from '@/src/utils/user'

const LOGIN_URL = 'https://painel.stratustelecom.com.br/main/login.php'

export interface AuthContext {
  user: User
  fullName: string
  isAdmin: boolean
  isSuperAdmin: boolean
  initials: string
}

/**
 * Helper para obter usuário autenticado em Server Components/Pages
 *
 * Use este ao invés de importar verify-jwt.ts diretamente
 */
export async function getAuthUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) return null

    const user = await verifyToken(token)
    return user
  } catch (error) {
    console.error('[getAuthUser] Error:', error)
    return null
  }
}

/**
 * Verifica autenticação e retorna dados do usuário com valores computados.
 * Redireciona para login se não autenticado.
 *
 * @example
 * const { user, fullName, isAdmin } = await requireAuth()
 */
export async function requireAuth(): Promise<AuthContext> {
  const user = await getAuthUser()

  if (!user) {
    redirect(LOGIN_URL)
  }

  return {
    user,
    fullName: getUserFullName(user),
    isAdmin: isUserAdmin(user),
    isSuperAdmin: isUserSuperAdmin(user),
    initials: getUserInitials(user),
  }
}

/**
 * Verifica se o usuário é admin.
 * Redireciona para home se não for admin.
 */
export async function requireAdminAuth(): Promise<AuthContext> {
  const auth = await requireAuth()

  if (!auth.isAdmin) {
    redirect('/')
  }

  return auth
}

/**
 * Verifica se o usuário é super admin.
 * Redireciona para home se não for super admin.
 */
export async function requireSuperAdminAuth(): Promise<AuthContext> {
  const auth = await requireAuth()

  if (!auth.isSuperAdmin) {
    redirect('/')
  }

  return auth
}
