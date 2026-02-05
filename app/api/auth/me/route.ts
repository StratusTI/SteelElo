import type { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  verifyAuth,
  getFullUserProfile,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from '@/src/auth'
import { ConflictError } from '@/src/use-cases/errors/conflict-error'
import { ResourceNotFoundError } from '@/src/use-cases/errors/resource-not-found-error'
import { makeGetUserProfileUseCase } from '@/src/use-cases/factories/make-get-user-profile'
import { makeUpdateUserProfileUseCase } from '@/src/use-cases/factories/make-update-user-profile'
import { standardError, successResponse } from '@/src/utils/http-response'

export async function GET() {
  const { user: authUser, error } = await verifyAuth()

  if (error || !authUser) {
    return error
  }

  try {
    const getUserProfile = makeGetUserProfileUseCase()
    const { user } = await getUserProfile.execute({ userId: authUser.id })

    const nomeCompleto = `${user.nome} ${user.sobrenome}`.trim()

    return successResponse(
      {
        id: user.id,
        nome: user.nome,
        sobrenome: user.sobrenome,
        username: user.username,
        nomeCompleto,
        email: user.email,
        foto: user.foto,
        telefone: user.telefone,
        admin: user.admin,
        superadmin: user.superadmin,
        idempresa: user.idempresa,
        empresa: user.empresa,
        departamento: user.departamento,
        time: user.time,
        online: user.online,
      },
      200,
      'User data retrieved successfully'
    )
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', 'Usuario nao encontrado')
    }

    console.error('[GET /api/auth/me] Error:', err)
    return standardError('INTERNAL_SERVER_ERROR', 'Erro ao buscar perfil')
  }
}

const updateProfileSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  sobrenome: z.string().min(1).max(100).optional(),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username deve conter apenas letras, numeros e underscore')
    .optional(),
})

export async function PATCH(req: NextRequest) {
  const { user: authUser, error } = await verifyAuth()

  if (error || !authUser) {
    return error
  }

  try {
    const body = await req.json()
    const validatedData = updateProfileSchema.parse(body)

    if (Object.keys(validatedData).length === 0) {
      return standardError('BAD_REQUEST', 'Nenhum campo para atualizar')
    }

    const updateUseCase = makeUpdateUserProfileUseCase()
    const { user: updatedUser } = await updateUseCase.execute({
      userId: authUser.id,
      ...validatedData,
    })

    const newAuthUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      admin: updatedUser.admin,
      superadmin: updatedUser.superadmin,
      enterpriseId: updatedUser.idempresa,
    }

    const newAccessToken = await generateAccessToken(newAuthUser)
    const { token: newRefreshToken } = await generateRefreshToken(authUser.id)
    await setAuthCookies(newAccessToken, newRefreshToken)

    const nomeCompleto = `${updatedUser.nome} ${updatedUser.sobrenome}`.trim()

    return successResponse(
      {
        id: updatedUser.id,
        nome: updatedUser.nome,
        sobrenome: updatedUser.sobrenome,
        username: updatedUser.username,
        nomeCompleto,
        email: updatedUser.email,
        foto: updatedUser.foto,
        telefone: updatedUser.telefone,
        admin: updatedUser.admin,
        superadmin: updatedUser.superadmin,
        idempresa: updatedUser.idempresa,
        departamento: updatedUser.departamento,
        time: updatedUser.time,
        online: updatedUser.online,
      },
      200,
      'Perfil atualizado com sucesso'
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return standardError('VALIDATION_ERROR', 'Dados invalidos', err.issues)
    }

    if (err instanceof ResourceNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', 'Usuario nao encontrado')
    }

    if (err instanceof ConflictError) {
      return standardError('CONFLICT', err.message)
    }

    console.error('[PATCH /api/auth/me] Error:', err)
    return standardError('INTERNAL_SERVER_ERROR', 'Erro ao atualizar perfil')
  }
}
