import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/src/auth';
import {
  InvalidUrlError,
  QuickLinkAlreadyExistsError,
  QuickLinkNotFoundError,
  QuickLinkNotOwnedError,
} from '@/src/use-cases/errors/quick-link-errors';
import { makeDeleteQuickLinkUseCase } from '@/src/use-cases/factories/make-delete-quick-link';
import { makeUpdateQuickLinkUseCase } from '@/src/use-cases/factories/make-update-quick-link';
import { standardError, successResponse } from '@/src/utils/http-response';

const updateQuickLinkSchema = z.object({
  url: z.string().min(1).max(2048).optional(),
  titulo: z.string().max(255).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const quickLinkId = Number.parseInt(id, 10);

  if (Number.isNaN(quickLinkId)) {
    return standardError('BAD_REQUEST', 'Invalid quick link ID');
  }

  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const body = await req.json();
    const validatedData = updateQuickLinkSchema.parse(body);

    const updateQuickLink = makeUpdateQuickLinkUseCase();

    const { quickLink } = await updateQuickLink.execute({
      user: authUser,
      quickLinkId,
      data: validatedData,
    });

    return successResponse({ quickLink }, 200, 'Quick link updated successfully');
  } catch (err) {
    if (err instanceof z.ZodError) {
      return standardError('VALIDATION_ERROR', 'Invalid request data', {
        errors: err.message,
      });
    }

    if (err instanceof QuickLinkNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', err.message);
    }

    if (err instanceof QuickLinkNotOwnedError) {
      return standardError('FORBIDDEN', err.message);
    }

    if (err instanceof QuickLinkAlreadyExistsError) {
      return standardError('CONFLICT', err.message);
    }

    if (err instanceof InvalidUrlError) {
      return standardError('VALIDATION_ERROR', err.message);
    }

    console.error('[PATCH /api/quick-links/[id]] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to update quick link');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const quickLinkId = Number.parseInt(id, 10);

  if (Number.isNaN(quickLinkId)) {
    return standardError('BAD_REQUEST', 'Invalid quick link ID');
  }

  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const deleteQuickLink = makeDeleteQuickLinkUseCase();

    await deleteQuickLink.execute({
      user: authUser,
      quickLinkId,
    });

    return successResponse({ success: true }, 200, 'Quick link deleted successfully');
  } catch (err) {
    if (err instanceof QuickLinkNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', err.message);
    }

    if (err instanceof QuickLinkNotOwnedError) {
      return standardError('FORBIDDEN', err.message);
    }

    console.error('[DELETE /api/quick-links/[id]] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to delete quick link');
  }
}
