import { verifyJWT } from '@/src/http/middlewares/verify-jwt';
import {
  generateAuthUrl,
  getOAuthConfig,
  isValidProvider,
} from '@/src/lib/oauth/providers';
import { standardError } from '@/src/utils/http-response';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ provider: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { provider } = await params;

  if (!isValidProvider(provider)) {
    return standardError('BAD_REQUEST', 'Provider inválido');
  }

  const { user, error } = await verifyJWT();

  if (error || !user) {
    return error;
  }

  const config = getOAuthConfig(provider);

  if (!config.clientId || !config.clientSecret) {
    return standardError(
      'INTERNAL_SERVER_ERROR',
      `Integração com ${provider} não está configurada`,
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  const authUrl = generateAuthUrl(provider, state);

  return NextResponse.redirect(authUrl);
}
