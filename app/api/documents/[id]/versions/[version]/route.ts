import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/src/auth';
import {
  DocumentForbiddenError,
  DocumentNotFoundError,
} from '@/src/use-cases/errors/document-errors';
import { makeGetDocumentByIdUseCase } from '@/src/use-cases/factories/make-get-document-by-id';
import { makeGetDocumentVersionsUseCase } from '@/src/use-cases/factories/make-get-document-versions';
import { standardError, successResponse } from '@/src/utils/http-response';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> },
) {
  const { id: documentId, version: versionParam } = await params;
  const versao = Number.parseInt(versionParam, 10);

  if (Number.isNaN(versao)) {
    return standardError('BAD_REQUEST', 'Invalid version number');
  }

  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const getDocument = makeGetDocumentByIdUseCase();
    await getDocument.execute({ user: authUser, documentId });

    const getVersions = makeGetDocumentVersionsUseCase();
    const { versions } = await getVersions.execute({
      user: authUser,
      documentId,
    });

    const version = versions.find((v) => v.versao === versao);

    if (!version) {
      return standardError('RESOURCE_NOT_FOUND', 'Version not found');
    }

    return successResponse({ version }, 200);
  } catch (err) {
    if (err instanceof DocumentNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', err.message);
    }

    if (err instanceof DocumentForbiddenError) {
      return standardError('FORBIDDEN', err.message);
    }

    console.error('[GET /api/documents/[id]/versions/[version]] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to fetch version');
  }
}
