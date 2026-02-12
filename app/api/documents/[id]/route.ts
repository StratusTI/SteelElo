import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/src/auth';
import {
  DocumentForbiddenError,
  DocumentNotFoundError,
  DocumentNotOwnedError,
} from '@/src/use-cases/errors/document-errors';
import { makeDeleteDocumentUseCase } from '@/src/use-cases/factories/make-delete-document';
import { makeGetDocumentByIdUseCase } from '@/src/use-cases/factories/make-get-document-by-id';
import { makeUpdateDocumentUseCase } from '@/src/use-cases/factories/make-update-document';
import { enrichDocumentWithCreator } from '@/src/utils/enrich-document-creator';
import { standardError, successResponse } from '@/src/utils/http-response';

const documentStatusEnum = z.enum(['draft', 'published', 'private', 'archived']);

const updateDocumentSchema = z.object({
  titulo: z.string().min(1).optional(),
  icone: z.string().optional(),
  conteudo: z.string().optional(),
  status: documentStatusEnum.optional(),
  isFullWidth: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: documentId } = await params;

  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const getDocument = makeGetDocumentByIdUseCase();

    const { document, isFavorite } = await getDocument.execute({
      user: authUser,
      documentId,
    });

    const enrichedDocument = await enrichDocumentWithCreator(document);

    return successResponse({ document: enrichedDocument, isFavorite }, 200);
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', err.message);
    }

    if (err instanceof DocumentForbiddenError) {
      return standardError('FORBIDDEN', err.message);
    }

    console.error('[GET /api/documents/[id]] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to fetch document');
  }
}

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
    const validatedData = updateDocumentSchema.parse(body);

    const updateDocument = makeUpdateDocumentUseCase();

    const { document } = await updateDocument.execute({
      user: authUser,
      documentId,
      data: validatedData,
    });

    const enrichedDocument = await enrichDocumentWithCreator(document);

    return successResponse({ document: enrichedDocument }, 200, 'Document updated successfully');
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

    console.error('[PATCH /api/documents/[id]] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to update document');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: documentId } = await params;

  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const deleteDocument = makeDeleteDocumentUseCase();

    await deleteDocument.execute({
      user: authUser,
      documentId,
    });

    return successResponse({ success: true }, 200, 'Document deleted successfully');
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', err.message);
    }

    if (err instanceof DocumentNotOwnedError) {
      return standardError('FORBIDDEN', err.message);
    }

    console.error('[DELETE /api/documents/[id]] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to delete document');
  }
}
