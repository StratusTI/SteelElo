import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/src/auth';
import {
  DocumentCircularReferenceError,
  DocumentNotFoundError,
  DocumentNotOwnedError,
} from '@/src/use-cases/errors/document-errors';
import { makeMoveDocumentUseCase } from '@/src/use-cases/factories/make-move-document';
import { standardError, successResponse } from '@/src/utils/http-response';

const moveDocumentSchema = z.object({
  parentId: z.string().nullable(),
  ordem: z.number().int().min(0).optional(),
  projetoId: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: documentId } = await params;

  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const body = await req.json();
    const validatedData = moveDocumentSchema.parse(body);

    const moveDocument = makeMoveDocumentUseCase();

    const { document } = await moveDocument.execute({
      user: authUser,
      documentId,
      parentId: validatedData.parentId,
      ordem: validatedData.ordem,
      projetoId: validatedData.projetoId,
    });

    return successResponse({ document }, 200, 'Document moved successfully');
  } catch (err) {
    if (err instanceof z.ZodError) {
      return standardError('VALIDATION_ERROR', 'Invalid request data', {
        errors: err.message,
      });
    }

    if (err instanceof DocumentNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', err.message);
    }

    if (err instanceof DocumentNotOwnedError) {
      return standardError('FORBIDDEN', err.message);
    }

    if (err instanceof DocumentCircularReferenceError) {
      return standardError('CONFLICT', err.message);
    }

    console.error('[PATCH /api/documents/[id]/move] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to move document');
  }
}
