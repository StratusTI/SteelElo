import type { NextRequest } from 'next/server';
import { DocumentNotFoundError } from '@/src/use-cases/errors/document-errors';
import { makeGetDocumentByTokenUseCase } from '@/src/use-cases/factories/make-get-document-by-token';
import { standardError, successResponse } from '@/src/utils/http-response';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  if (!token || token.length === 0) {
    return standardError('BAD_REQUEST', 'Invalid token');
  }

  try {
    const getDocument = makeGetDocumentByTokenUseCase();

    const { document } = await getDocument.execute({ token });

    return successResponse({ document }, 200);
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', err.message);
    }

    console.error('[GET /api/documents/public/[token]] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to fetch document');
  }
}
