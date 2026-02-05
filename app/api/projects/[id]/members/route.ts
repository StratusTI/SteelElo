import type { NextRequest } from 'next/server'
import { revalidateTag, unstable_cache } from 'next/cache'
import { ZodError } from 'zod'
import { requireProjectRole } from '@/src/http/middlewares/require-project-role'
import type { User } from '@/src/@types/user'
import type { AuthUser } from '@/src/auth'
import { ConflictError } from '@/src/use-cases/errors/conflict-error'
import { InsufficientPermissionsError } from '@/src/use-cases/errors/insufficient-permissions-error'
import { ResourceNotFoundError } from '@/src/use-cases/errors/resource-not-found-error'
import { makeAddProjectMemberUseCase } from '@/src/use-cases/factories/make-add-project-member'
import { makeGetProjectMembersUsecase } from '@/src/use-cases/factories/make-get-project-members'
import { standardError, successResponse } from '@/src/utils/http-response'
import { addMemberSchema } from '@/src/utils/zod-schemas/add-member-schema'

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const projectId = Number.parseInt(id, 10)

  if (Number.isNaN(projectId)) {
    return standardError('BAD_REQUEST', 'Invalid project ID')
  }

  const { user: authUser, error } = await requireProjectRole({
    projectId,
    minimumRole: 'viewer',
  })

  if (error || !authUser) {
    return error
  }

  try {
    const user = authUserToUser(authUser)

    const getCachedMembers = unstable_cache(
      async (userJson: string, projId: number) => {
        const parsedUser = JSON.parse(userJson) as User
        const getProjectMembers = makeGetProjectMembersUsecase()
        const { members } = await getProjectMembers.execute({
          user: parsedUser,
          projectId: projId,
        })
        return members.map((m) => ({
          id: m.id,
          userId: m.usuarioId,
          role: m.role,
          source: m.source,
          addedAt: m.adicionadoEm,
          user: {
            id: m.usuario.id,
            nome: m.usuario.nome,
            sobrenome: m.usuario.sobrenome,
            email: m.usuario.email,
            foto: m.usuario.foto,
          },
        }))
      },
      [`project-members-${projectId}`],
      {
        revalidate: 30,
        tags: [`project-${projectId}-members`],
      }
    )

    const members = await getCachedMembers(JSON.stringify(user), projectId)

    return successResponse({ members }, 200, undefined, {
      maxAge: 30,
      staleWhileRevalidate: 60,
      private: true,
    })
  } catch (err) {
    console.error('[GET] /api/projects/[id]/members Unexpected error', err)
    return standardError('INTERNAL_SERVER_ERROR', 'Unexpected error')
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const projectId = Number.parseInt(id, 10)

  if (Number.isNaN(projectId)) {
    return standardError('BAD_REQUEST', 'Invalid project ID')
  }

  const { user: authUser, error: authError } = await requireProjectRole({
    projectId,
    permission: 'invite_member',
  })

  if (authError || !authUser) {
    return authError
  }

  try {
    const body = await req.json()
    const validatedData = addMemberSchema.parse(body)

    const user = authUserToUser(authUser)
    const addMember = makeAddProjectMemberUseCase()

    const { member } = await addMember.execute({
      user,
      projectId,
      userId: validatedData.userId,
      role: validatedData.role,
    })

    revalidateTag(`project-${projectId}-members`, 'max')

    return successResponse(
      {
        member: {
          id: member.id,
          userId: member.userId,
          role: member.role,
          addedAt: member.addedAt,
          user: member.user,
        },
      },
      201,
      'Member added successfully'
    )
  } catch (err) {
    if (err instanceof ZodError) {
      return standardError('VALIDATION_ERROR', 'Validation failed')
    }

    if (err instanceof ResourceNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', 'User or project not found')
    }

    if (err instanceof ConflictError) {
      return standardError('CONFLICT', err.message)
    }

    if (err instanceof InsufficientPermissionsError) {
      return standardError('FORBIDDEN', err.message)
    }

    console.error('[POST /api/projects/[id]/members]  Unexpected error', err)
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to add member')
  }
}
