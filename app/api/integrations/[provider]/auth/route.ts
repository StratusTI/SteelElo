import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/src/auth';
import {
  generateAuthUrl,
  getOAuthConfig,
  isValidProvider,
} from '@/src/lib/oauth/providers';
import { standardError } from '@/src/utils/http-response';

interface RouteParams {
  params: Promise<{ provider: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { provider } = await params;

  if (!isValidProvider(provider)) {
    return standardError('BAD_REQUEST', 'Provider invalido');
  }

  const { user, error } = await verifyAuth();

  if (error || !user) {
    return error;
  }

  const config = getOAuthConfig(provider);

  if (!config.clientId || !config.clientSecret) {
    return standardError(
      'INTERNAL_SERVER_ERROR',
      `Integracao com ${provider} nao esta configurada`,
    );
  }

  const state = Buffer.from(
    JSON.stringify({
      userId: user.id,
      provider,
      timestamp: Date.now(),
    }),
  ).toString('base64url');

  const cookieStore = await cookies();
  cookieStore.set(`oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 60 * 10,
    path: '/',
  });

  const authUrl = generateAuthUrl(provider, state);

  return NextResponse.redirect(authUrl);
}
