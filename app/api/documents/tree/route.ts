import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/src/auth';
import { makeGetDocumentTreeUseCase } from '@/src/use-cases/factories/make-get-document-tree';
import { standardError, successResponse } from '@/src/utils/http-response';

export async function GET(req: NextRequest) {
  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const { searchParams } = new URL(req.url);
    const empresaId = Number.parseInt(
      searchParams.get('empresaId') || String(authUser.enterpriseId),
      10,
    );

    const getTree = makeGetDocumentTreeUseCase();

    const { tree } = await getTree.execute({
      user: authUser,
      empresaId,
    });

    return successResponse({ tree }, 200);
  } catch (err) {
    console.error('[GET /api/documents/tree] Unexpected error:', err);
    return standardError(
      'INTERNAL_SERVER_ERROR',
      'Failed to fetch document tree',
    );
  }
}
