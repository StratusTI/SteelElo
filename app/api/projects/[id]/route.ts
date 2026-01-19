import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { ProjetoPriority, ProjetoStatus } from '@/src/generated/elo';
import { requireProjectRole } from '@/src/http/middlewares/require-project-role';
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

// GET /api/projects/[id] - Detalhes do projeto
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const projectId = Number.parseInt(params.id, 10);

  if (Number.isNaN(projectId)) {
    return standardError('BAD_REQUEST', 'Invalid project ID');
  }

  // Validar apenas autenticação (permissão será checada no use case)
  const { user, error } = await requireProjectRole({
    projectId,
    minimumRole: 'viewer',
  });

  if (error || !user) {
    return error;
  }

  try {
    const getProjectDetails = makeGetProjectDetailsUseCase();

    const { project } = await getProjectDetails.execute({
      user,
      projectId,
    });

    return successResponse({ project }, 200);
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', 'Project not found');
    }

    console.error('[GET /api/projects/[id]] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to fetch project');
  }
}

// PATCH /api/projects/[id] - Atualizar projeto
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const projectId = Number.parseInt(params.id, 10);

  if (Number.isNaN(projectId)) {
    return standardError('BAD_REQUEST', 'Invalid project ID');
  }

  // Validar permissão de admin
  const { user, userRole, error } = await requireProjectRole({
    projectId,
    minimumRole: 'admin',
  });

  if (error || !user || !userRole) {
    return error;
  }

  try {
    const body = await req.json();
    const validatedData = updateProjectSchema.parse(body);

    // Converter strings de data para Date objects
    const data = {
      ...validatedData,
      dataInicio: validatedData.dataInicio
        ? new Date(validatedData.dataInicio)
        : undefined,
      dataFim: validatedData.dataFim
        ? new Date(validatedData.dataFim)
        : undefined,
    };

    const updateProject = makeUpdateProjectUseCase();

    const { project } = await updateProject.execute({
      user,
      userRole,
      projectId,
      data,
    });

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

// DELETE /api/projects/[id] - Arquivar projeto
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const projectId = Number.parseInt(params.id, 10);

  if (Number.isNaN(projectId)) {
    return standardError('BAD_REQUEST', 'Invalid project ID');
  }

  // Validar permissão de owner
  const { user, userRole, error } = await requireProjectRole({
    projectId,
    permission: 'delete_project',
  });

  if (error || !user || !userRole) {
    return error;
  }

  try {
    const archiveProject = makeArchiveProjectUseCase();

    await archiveProject.execute({
      user,
      userRole,
      projectId,
    });

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
