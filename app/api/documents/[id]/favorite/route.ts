import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/src/auth';
import { DocumentNotFoundError } from '@/src/use-cases/errors/document-errors';
import { makeToggleFavoriteDocumentUseCase } from '@/src/use-cases/factories/make-toggle-favorite-document';
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
    const toggleFavorite = makeToggleFavoriteDocumentUseCase();

    const { isFavorite } = await toggleFavorite.execute({
      user: authUser,
      documentId,
    });

    return successResponse(
      { isFavorite },
      200,
      isFavorite ? 'Document added to favorites' : 'Document removed from favorites',
    );
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', err.message);
    }

    console.error('[POST /api/documents/[id]/favorite] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to toggle favorite');
  }
}
