import type { NextRequest } from 'next/server'
import { CreateUserSchema } from '@/src/schemas/user.schema'
import { UserService } from '@/src/services/user.service'
import { successResponse, errorResponse } from '@/src/lib/http'
import { ValidationError } from '@/src/errors'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = CreateUserSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse(
      new ValidationError('Dados inválidos', parsed.error.issues),
    )
  }

  const result = await UserService.create(parsed.data)

  if (!result.ok) return errorResponse(result.error)

  return successResponse(result.value, 201)
}
