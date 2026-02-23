'use server'

import { redirect } from 'next/navigation'
import { setAuthCookies } from '@/src/lib/cookies'
import { LoginSchema } from '@/src/schemas/auth.schema'
import { AuthService } from '@/src/services/auth.service'

export interface LoginState {
  error: string | null
  fieldErrors: {
    email?: string
    password?: string
  }
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = LoginSchema.safeParse(raw)

  if (!parsed.success) {
    const fieldErrors: LoginState['fieldErrors'] = {}

    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof typeof fieldErrors
      if (field) fieldErrors[field] = issue.message
    }

    return { error: null, fieldErrors }
  }

  const result = await AuthService.login(parsed.data)

  if (!result.ok) {
    return { error: result.error.message, fieldErrors: {} }
  }

  await setAuthCookies(result.value.accessToken, result.value.refreshToken)

  redirect('/')
}
