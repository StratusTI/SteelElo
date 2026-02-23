import type { NextRequest } from 'next/server'
import { CreateUserSchema } from '@/src/schemas/user.schema'
import { UserService } from '@/src/services/user.service'
import { handleError, standardError, successResponse } from '@/utils/http-response'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = CreateUserSchema.safeParse(body)

  if (!parsed.success) {
    return standardError('VALIDATION_ERROR', 'Dados inválidos', parsed.error.issues)
  }

  const result = await UserService.create(parsed.data)

  if (!result.ok) return handleError(result.error)

  return successResponse(result.value, 201)
}
