import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/src/auth';
import {
  EmptyStickyContentError,
  InvalidStickyColorError,
  StickyNotFoundError,
  StickyNotOwnedError,
} from '@/src/use-cases/errors/sticky-errors';
import { makeDeleteStickyUseCase } from '@/src/use-cases/factories/make-delete-sticky';
import { makeUpdateStickyUseCase } from '@/src/use-cases/factories/make-update-sticky';
import { standardError, successResponse } from '@/src/utils/http-response';

const stickyColorEnum = z.enum([
  'gray',
  'peach',
  'pink',
  'orange',
  'green',
  'lightblue',
  'darkblue',
  'purple',
]);

const updateStickySchema = z.object({
  content: z.string().min(1).optional(),
  backgroundColor: stickyColorEnum.optional(),
  isBold: z.boolean().optional(),
  isItalic: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const stickyId = Number.parseInt(id, 10);

  if (Number.isNaN(stickyId)) {
    return standardError('BAD_REQUEST', 'Invalid sticky ID');
  }

  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const body = await req.json();
    const validatedData = updateStickySchema.parse(body);

    const updateSticky = makeUpdateStickyUseCase();

    const { sticky } = await updateSticky.execute({
      user: authUser,
      stickyId,
      data: validatedData,
    });

    return successResponse(
      { sticky },
      200,
      'Sticky updated successfully',
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return standardError('VALIDATION_ERROR', 'Invalid request data', {
        errors: err.message,
      });
    }

    if (err instanceof StickyNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', err.message);
    }

    if (err instanceof StickyNotOwnedError) {
      return standardError('FORBIDDEN', err.message);
    }

    if (err instanceof EmptyStickyContentError) {
      return standardError('VALIDATION_ERROR', err.message);
    }

    if (err instanceof InvalidStickyColorError) {
      return standardError('VALIDATION_ERROR', err.message);
    }

    console.error('[PATCH /api/stickies/[id]] Unexpected error:', err);
    return standardError(
      'INTERNAL_SERVER_ERROR',
      'Failed to update sticky',
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const stickyId = Number.parseInt(id, 10);

  if (Number.isNaN(stickyId)) {
    return standardError('BAD_REQUEST', 'Invalid sticky ID');
  }

  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const deleteSticky = makeDeleteStickyUseCase();

    await deleteSticky.execute({
      user: authUser,
      stickyId,
    });

    return successResponse(
      { success: true },
      200,
      'Sticky deleted successfully',
    );
  } catch (err) {
    if (err instanceof StickyNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', err.message);
    }

    if (err instanceof StickyNotOwnedError) {
      return standardError('FORBIDDEN', err.message);
    }

    console.error('[DELETE /api/stickies/[id]] Unexpected error:', err);
    return standardError(
      'INTERNAL_SERVER_ERROR',
      'Failed to delete sticky',
    );
  }
}
