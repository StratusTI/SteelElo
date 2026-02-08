import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/src/auth';
import {
  InvalidUrlError,
  QuickLinkAlreadyExistsError,
} from '@/src/use-cases/errors/quick-link-errors';
import { makeCreateQuickLinkUseCase } from '@/src/use-cases/factories/make-create-quick-link';
import { makeGetQuickLinksUseCase } from '@/src/use-cases/factories/make-get-quick-links';
import { standardError, successResponse } from '@/src/utils/http-response';

const createQuickLinkSchema = z.object({
  url: z.string().min(1).max(2048),
  titulo: z.string().max(255).optional(),
});

export async function GET() {
  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const getQuickLinks = makeGetQuickLinksUseCase();

    const { quickLinks } = await getQuickLinks.execute({
      user: authUser,
    });

    return successResponse({ quickLinks }, 200);
  } catch (err) {
    console.error('[GET /api/quick-links] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to fetch quick links');
  }
}

export async function POST(req: NextRequest) {
  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const body = await req.json();
    const validatedData = createQuickLinkSchema.parse(body);

    const createQuickLink = makeCreateQuickLinkUseCase();

    const { quickLink } = await createQuickLink.execute({
      user: authUser,
      data: validatedData,
    });

    return successResponse({ quickLink }, 201, 'Quick link created successfully');
  } catch (err) {
    if (err instanceof z.ZodError) {
      return standardError('VALIDATION_ERROR', 'Invalid request data', {
        errors: err.message,
      });
    }

    if (err instanceof QuickLinkAlreadyExistsError) {
      return standardError('CONFLICT', err.message);
    }

    if (err instanceof InvalidUrlError) {
      return standardError('VALIDATION_ERROR', err.message);
    }

    console.error('[POST /api/quick-links] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to create quick link');
  }
}
