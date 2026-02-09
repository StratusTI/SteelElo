import type { NextRequest } from 'next/server';
import { revalidateTag, unstable_cache } from 'next/cache';
import { z } from 'zod';
import { ProjetoPriority, ProjetoStatus } from '@/src/generated/elo';
import { requireProjectRole } from '@/src/http/middlewares/require-project-role';
import type { User } from '@/src/@types/user';
import type { AuthUser } from '@/src/auth';
import {
  InvalidColorFormatError,
  InvalidDateRangeError,
  ProjectNameAlreadyExistsError,
} from '@/src/use-cases/errors/project-errors';
import { ResourceNotFoundError } from '@/src/use-cases/errors/resource-not-found-error';
import { makeArchiveProjectUseCase } from '@/src/use-cases/factories/make-archive-project';
import { makeGetProjectDetailsUseCase } from '@/src/use-cases/factories/make-get-project-details';
import { makeUpdateProjectUseCase } from '@/src/use-cases/factories/make-update-project';
import { standardError, successResponse } from '@/src/utils/http-response';

const updateProjectSchema = z.object({
  nome: z.string().min(3).max(255).optional(),
  projectId: z.string().max(10).optional(),
  descricao: z.string().optional(),
  icone: z.string().max(50).optional(),
  backgroundUrl: z.string().max(255).optional(),
  dataInicio: z.date().optional(),
  dataFim: z.date().optional(),
  status: z.enum(ProjetoStatus).optional(),
  prioridade: z.enum(ProjetoPriority).optional(),
  acesso: z.boolean().optional(),
});

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
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const projectId = Number.parseInt(id, 10);

  if (Number.isNaN(projectId)) {
    return standardError('BAD_REQUEST', 'Invalid project ID');
  }

  const { user: authUser, error } = await requireProjectRole({
    projectId,
    minimumRole: 'viewer',
  });

  if (error || !authUser) {
    return error;
  }

  try {
    const user = authUserToUser(authUser);

    const getCachedProjectDetails = unstable_cache(
      async (userJson: string, projId: number) => {
        const parsedUser = JSON.parse(userJson) as User;
        const getProjectDetails = makeGetProjectDetailsUseCase();
        return getProjectDetails.execute({
          user: parsedUser,
          projectId: projId,
        });
      },
      [`project-${projectId}`],
      {
        revalidate: 60,
        tags: ['projects', `project-${projectId}`],
      },
    );

    const { project } = await getCachedProjectDetails(
      JSON.stringify(user),
      projectId,
    );

    return successResponse({ project }, 200, undefined, {
      maxAge: 60,
      staleWhileRevalidate: 120,
      private: true,
    });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', 'Project not found');
    }

    console.error('[GET /api/projects/[id]] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to fetch project');
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const projectId = Number.parseInt(id, 10);

  if (Number.isNaN(projectId)) {
    return standardError('BAD_REQUEST', 'Invalid project ID');
  }

  const {
    user: authUser,
    userRole,
    error,
  } = await requireProjectRole({
    projectId,
    minimumRole: 'admin',
  });

  if (error || !authUser || !userRole) {
    return error;
  }

  try {
    const body = await req.json();
    const validatedData = updateProjectSchema.parse(body);

    const data = {
      ...validatedData,
      dataInicio: validatedData.dataInicio
        ? new Date(validatedData.dataInicio)
        : undefined,
      dataFim: validatedData.dataFim
        ? new Date(validatedData.dataFim)
        : undefined,
    };

    const user = authUserToUser(authUser);
    const updateProject = makeUpdateProjectUseCase();

    const { project } = await updateProject.execute({
      user,
      userRole,
      projectId,
      data,
    });

    revalidateTag('projects', 'max');
    revalidateTag(`project-${projectId}`, 'max');
    revalidateTag(`projects-enterprise-${authUser.enterpriseId}`, 'max');

    return successResponse({ project }, 200, 'Project updated successfully');
  } catch (err) {
    if (err instanceof z.ZodError) {
      return standardError('VALIDATION_ERROR', 'Invalid request data', {
        errors: err.message,
      });
    }

    if (err instanceof ResourceNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', 'Project not found');
    }

    if (err instanceof ProjectNameAlreadyExistsError) {
      return standardError('CONFLICT', err.message);
    }

    if (err instanceof InvalidDateRangeError) {
      return standardError('VALIDATION_ERROR', err.message);
    }

    if (err instanceof InvalidColorFormatError) {
      return standardError('VALIDATION_ERROR', err.message);
    }

    console.error('[PATCH /api/projects/[id]] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to update project');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const projectId = Number.parseInt(id, 10);

  if (Number.isNaN(projectId)) {
    return standardError('BAD_REQUEST', 'Invalid project ID');
  }

  const {
    user: authUser,
    userRole,
    error,
  } = await requireProjectRole({
    projectId,
    permission: 'delete_project',
  });

  if (error || !authUser || !userRole) {
    return error;
  }

  try {
    const user = authUserToUser(authUser);
    const archiveProject = makeArchiveProjectUseCase();

    await archiveProject.execute({
      user,
      userRole,
      projectId,
    });

    revalidateTag('projects', 'max');
    revalidateTag(`project-${projectId}`, 'max');
    revalidateTag(`projects-enterprise-${authUser.enterpriseId}`, 'max');

    return successResponse(
      { success: true },
      200,
      'Project archived successfully',
    );
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', 'Project not found');
    }

    console.error('[DELETE /api/projects/[id]] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to archive project');
  }
}
