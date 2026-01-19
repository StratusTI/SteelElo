import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { ProjetoPriority, ProjetoStatus } from '@/src/generated/elo';
import { verifyJWT } from '@/src/http/middlewares/verify-jwt';
import {
  InvalidColorFormatError,
  InvalidDateRangeError,
  ProjectNameAlreadyExistsError,
} from '@/src/use-cases/errors/project-errors';
import { makeCreateProjectUseCase } from '@/src/use-cases/factories/make-create-project';
import { standardError, successResponse } from '@/src/utils/http-response';

const createProjectSchema = z.object({
  nome: z.string().min(3).max(255),
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

export async function POST(req: NextRequest) {
  const { user, error: authError } = await verifyJWT();

  if (authError || !user) {
    return authError;
  }

  if (!user.idempresa) {
    return standardError(
      'BAD_REQUEST',
      'User must belong to a company to create projects',
    );
  }

  try {
    const body = await req.json();
    const validateData = createProjectSchema.parse(body);

    const data = {
      ...validateData,
      dataInicio: validateData.dataInicio
        ? new Date(validateData.dataInicio)
        : undefined,
      dataFim: validateData.dataFim
        ? new Date(validateData.dataFim)
        : undefined,
    };

    const createProject = makeCreateProjectUseCase();

    const { project } = await createProject.execute({
      user,
      data,
    });

    return successResponse({ project }, 201, 'Project created successfully');
  } catch (err) {
    if (err instanceof z.ZodError) {
      return standardError('VALIDATION_ERROR', 'Invalid request data', {
        errors: err.message,
      });
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

    console.error('[POST /api/projects] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to create project');
  }
}
