import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/src/auth';
import {
  DocumentForbiddenError,
  DocumentNotFoundError,
} from '@/src/use-cases/errors/document-errors';
import { makeDuplicateDocumentUseCase } from '@/src/use-cases/factories/make-duplicate-document';
import { standardError, successResponse } from '@/src/utils/http-response';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: documentId } = await params;

  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const duplicateDocument = makeDuplicateDocumentUseCase();

    const { document } = await duplicateDocument.execute({
      user: authUser,
      documentId,
    });

    return successResponse({ document }, 201, 'Document duplicated successfully');
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', err.message);
    }

    if (err instanceof DocumentForbiddenError) {
      return standardError('FORBIDDEN', err.message);
    }

    console.error('[POST /api/documents/[id]/duplicate] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to duplicate document');
  }
}
