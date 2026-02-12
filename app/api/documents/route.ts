import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/src/auth';
import { makeCreateDocumentUseCase } from '@/src/use-cases/factories/make-create-document';
import { makeGetDocumentsUseCase } from '@/src/use-cases/factories/make-get-documents';
import {
  enrichDocumentWithCreator,
  enrichDocumentsWithCreator,
} from '@/src/utils/enrich-document-creator';
import { standardError, successResponse } from '@/src/utils/http-response';

const documentStatusEnum = z.enum(['draft', 'published', 'private', 'archived']);

const createDocumentSchema = z.object({
  titulo: z.string().min(1),
  icone: z.string().optional(),
  conteudo: z.string().optional(),
  parentId: z.string().optional(),
  empresaId: z.number().int().positive().optional(),
  projetoId: z.string().optional(),
  status: documentStatusEnum.optional(),
});

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
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const parentId = searchParams.get('parentId');

    const getDocuments = makeGetDocumentsUseCase();

    const { documents } = await getDocuments.execute({
      user: authUser,
      empresaId,
      filters: {
        status: status as any,
        search,
        parentId: parentId !== null ? (parentId === 'null' ? null : parentId) : undefined,
      },
    });

    const enrichedDocuments = await enrichDocumentsWithCreator(documents);

    return successResponse({ documents: enrichedDocuments }, 200);
  } catch (err) {
    console.error('[GET /api/documents] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to fetch documents');
  }
}

export async function POST(req: NextRequest) {
  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const body = await req.json();
    const validatedData = createDocumentSchema.parse(body);

    const createDocument = makeCreateDocumentUseCase();

    const { document } = await createDocument.execute({
      user: authUser,
      data: validatedData,
    });

    const enrichedDocument = await enrichDocumentWithCreator(document);

    return successResponse({ document: enrichedDocument }, 201, 'Document created successfully');
  } catch (err) {
    if (err instanceof z.ZodError) {
      return standardError('VALIDATION_ERROR', 'Invalid request data', {
        errors: err.message,
      });
    }

    console.error('[POST /api/documents] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to create document');
  }
}
