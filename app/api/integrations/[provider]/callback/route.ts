import { makeConnectIntegrationUseCase } from '@/src/use-cases/factories/make-connect-integration';
import { sendWelcomeNotification } from '@/src/lib/messaging';
import {
  exchangeCodeForToken,
  getUserInfo,
  isValidProvider,
  type OAuthProvider,
} from '@/src/lib/oauth/providers';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ provider: string }>;
}

interface OAuthState {
  userId: number;
  provider: string;
  timestamp: number;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function createErrorRedirect(message: string): NextResponse {
  const url = new URL('/settings', APP_URL);
  url.searchParams.set('integration_error', message);
  return NextResponse.redirect(url);
}

function createSuccessRedirect(provider: string): NextResponse {
  const url = new URL('/settings', APP_URL);
  url.searchParams.set('integration_success', provider);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { provider } = await params;

  if (!isValidProvider(provider)) {
    return createErrorRedirect('Provider inválido');
  }

  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error(`[OAuth ${provider}] Error:`, error, errorDescription);
    return createErrorRedirect(errorDescription || error);
  }

  if (!code || !state) {
    return createErrorRedirect('Parâmetros inválidos');
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(`oauth_state_${provider}`)?.value;

  if (!storedState || storedState !== state) {
    return createErrorRedirect('Estado inválido. Tente novamente.');
  }

  cookieStore.delete(`oauth_state_${provider}`);

  let parsedState: OAuthState;
  try {
    parsedState = JSON.parse(Buffer.from(state, 'base64url').toString());
  } catch {
    return createErrorRedirect('Estado inválido');
  }

  const stateAge = Date.now() - parsedState.timestamp;
  if (stateAge > 10 * 60 * 1000) {
    return createErrorRedirect('Sessão expirada. Tente novamente.');
  }

  try {
    const tokenResponse = await exchangeCodeForToken(
      provider as OAuthProvider,
      code,
    );
    const userInfo = await getUserInfo(
      provider as OAuthProvider,
      tokenResponse.accessToken,
    );

    const connectIntegration = makeConnectIntegrationUseCase();
    await connectIntegration.execute({
      userId: parsedState.userId,
      provider,
      providerId: userInfo.id,
      providerLogin: userInfo.login,
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      tokenExpires: tokenResponse.expiresIn
        ? new Date(Date.now() + tokenResponse.expiresIn * 1000)
        : undefined,
      scopes: tokenResponse.scope,
    });

    // Envia mensagem de boas-vindas para Slack ou Teams
    if (provider === 'slack' || provider === 'teams') {
      await sendWelcomeNotification(
        provider,
        tokenResponse.accessToken,
        userInfo,
      );
    }

    return createSuccessRedirect(provider);
  } catch (err) {
    console.error(`[OAuth ${provider}] Callback error:`, err);
    return createErrorRedirect('Erro ao conectar. Tente novamente.');
  }
}
