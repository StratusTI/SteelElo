import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/src/auth';
import {
  DocumentNotFoundError,
  DocumentNotOwnedError,
} from '@/src/use-cases/errors/document-errors';
import { makePublishDocumentUseCase } from '@/src/use-cases/factories/make-publish-document';
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
    const publishDocument = makePublishDocumentUseCase();

    const { document } = await publishDocument.execute({
      user: authUser,
      documentId,
    });

    return successResponse({ document }, 200, 'Document published successfully');
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', err.message);
    }

    if (err instanceof DocumentNotOwnedError) {
      return standardError('FORBIDDEN', err.message);
    }

    console.error('[POST /api/documents/[id]/publish] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to publish document');
  }
}
