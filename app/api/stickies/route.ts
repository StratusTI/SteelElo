import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/src/auth';
import {
  EmptyStickyContentError,
  InvalidStickyColorError,
} from '@/src/use-cases/errors/sticky-errors';
import { makeCreateStickyUseCase } from '@/src/use-cases/factories/make-create-sticky';
import { makeGetStickiesUseCase } from '@/src/use-cases/factories/make-get-stickies';
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

const createStickySchema = z.object({
  content: z.string().optional().default(''),
  backgroundColor: stickyColorEnum.optional(),
  isBold: z.boolean().optional(),
  isItalic: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;

    const getStickies = makeGetStickiesUseCase();

    const { stickies } = await getStickies.execute({
      user: authUser,
      filters: { search },
    });

    return successResponse({ stickies }, 200);
  } catch (err) {
    console.error('[GET /api/stickies] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to fetch stickies');
  }
}

export async function POST(req: NextRequest) {
  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const body = await req.json();
    const validatedData = createStickySchema.parse(body);

    const createSticky = makeCreateStickyUseCase();

    const { sticky } = await createSticky.execute({
      user: authUser,
      data: validatedData,
    });

    return successResponse({ sticky }, 201, 'Sticky created successfully');
  } catch (err) {
    if (err instanceof z.ZodError) {
      return standardError('VALIDATION_ERROR', 'Invalid request data', {
        errors: err.message,
      });
    }

    if (err instanceof EmptyStickyContentError) {
      return standardError('VALIDATION_ERROR', err.message);
    }

    if (err instanceof InvalidStickyColorError) {
      return standardError('VALIDATION_ERROR', err.message);
    }

    console.error('[POST /api/stickies] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to create sticky');
  }
}
