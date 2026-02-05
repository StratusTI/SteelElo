import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { requireProjectRole } from '@/src/http/middlewares/require-project-role'
import type { User } from '@/src/@types/user'
import type { AuthUser } from '@/src/auth'
import { InsufficientPermissionsError } from '@/src/use-cases/errors/insufficient-permissions-error'
import { ResourceNotFoundError } from '@/src/use-cases/errors/resource-not-found-error'
import { makeRemoveProjectMemberUseCase } from '@/src/use-cases/factories/make-remove.project-member'
import { makeUpdateProjectMemberRoleUseCase } from '@/src/use-cases/factories/make-update-project-member-role'
import { standardError, successResponse } from '@/src/utils/http-response'
import { updateMemberRoleSchema } from '@/src/utils/zod-schemas/update-member-role-schema'

function authUserToUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    email: authUser.email,
    admin: authUser.admin,
    superadmin: authUser.superadmin,
    idempresa: authUser.enterpriseId,
    nome: '',
    sobrenome: '',
    username: '',
    foto: '',
    telefone: '',
    empresa: '',
    departamento: null,
    time: null,
    online: false,
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params
  const projectId = Number.parseInt(id, 10)
  const memberUserId = Number.parseInt(userId, 10)

  if (Number.isNaN(projectId) || Number.isNaN(memberUserId)) {
    return standardError('BAD_REQUEST', 'Invalid project or user ID')
  }

  const { user: authUser, error: authError } = await requireProjectRole({
    projectId,
    permission: 'change_member_role',
  })

  if (authError || !authUser) {
    return authError
  }

  try {
    const body = await req.json()
    const validatedData = updateMemberRoleSchema.parse(body)

    const user = authUserToUser(authUser)
    const updateMemberRole = makeUpdateProjectMemberRoleUseCase()

    const { member } = await updateMemberRole.execute({
      user,
      projectId,
      userId: memberUserId,
      newRole: validatedData.role,
    })

    return successResponse(
      {
        member: {
          id: member.id,
          userId: member.userId,
          role: member.role,
          addedAt: member.addedAt,
        },
      },
      200,
      'Member role updated successfully'
    )
  } catch (err) {
    if (err instanceof ZodError) {
      return standardError('RESOURCE_NOT_FOUND', 'Validation failed')
    }

    if (err instanceof ResourceNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', 'Member not found')
    }

    if (err instanceof InsufficientPermissionsError) {
      return standardError('FORBIDDEN', err.message)
    }

    console.error(
      '[PATCH /api/projects/[id]/members/[userId]] Unexpected error:',
      err
    )
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to update member role')
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params
  const projectId = Number.parseInt(id, 10)
  const memberUserId = Number.parseInt(userId, 10)

  if (Number.isNaN(projectId) || Number.isNaN(memberUserId)) {
    return standardError('BAD_REQUEST', 'Invalid project or user ID')
  }

  const { user: authUser, error: authError } = await requireProjectRole({
    projectId,
    permission: 'remove_member',
  })

  if (authError || !authUser) {
    return authError
  }

  try {
    const user = authUserToUser(authUser)
    const removeMember = makeRemoveProjectMemberUseCase()

    const result = await removeMember.execute({
      user,
      projectId,
      userId: memberUserId,
    })

    return successResponse(
      {
        message: result.message,
      },
      200,
      'Member removed successfully'
    )
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', 'Member not found')
    }

    if (err instanceof InsufficientPermissionsError) {
      return standardError('FORBIDDEN', err.message)
    }

    console.error(
      '[DELETE /api/projects/[id]/members/[userId]] Unexpected error:',
      err
    )
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to remove member')
  }
}
