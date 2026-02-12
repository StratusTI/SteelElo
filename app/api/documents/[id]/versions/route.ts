import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/src/auth';
import {
  DocumentForbiddenError,
  DocumentNotFoundError,
} from '@/src/use-cases/errors/document-errors';
import { makeGetDocumentVersionsUseCase } from '@/src/use-cases/factories/make-get-document-versions';
import { standardError, successResponse } from '@/src/utils/http-response';

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
    const getVersions = makeGetDocumentVersionsUseCase();

    const { versions } = await getVersions.execute({
      user: authUser,
      documentId,
    });

    return successResponse({ versions }, 200);
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', err.message);
    }

    if (err instanceof DocumentForbiddenError) {
      return standardError('FORBIDDEN', err.message);
    }

    console.error('[GET /api/documents/[id]/versions] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to fetch versions');
  }
}
