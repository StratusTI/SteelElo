import { type NextRequest, NextResponse } from 'next/server';
import {
  clearAuthCookies,
  getAuthTokens,
  setAuthCookies,
} from '@/src/auth/cookies';
import { generateNewTokensFromRefresh } from '@/src/auth/middleware';
import { verifyRefreshToken } from '@/src/auth/tokens';

const LOGIN_URL = '/login';

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/';

  try {
    const { refreshToken } = await getAuthTokens();

    if (!refreshToken) {
      return NextResponse.redirect(LOGIN_URL);
    }

    const refreshData = await verifyRefreshToken(refreshToken);

    if (!refreshData) {
      await clearAuthCookies();
      return NextResponse.redirect(LOGIN_URL);
    }

    const result = await generateNewTokensFromRefresh(refreshData);

    if (!result) {
      await clearAuthCookies();
      return NextResponse.redirect(LOGIN_URL);
    }

    // Seta os novos tokens
    await setAuthCookies(result.accessToken, result.refreshToken);

    // Redireciona de volta para a página original
    return NextResponse.redirect(new URL(returnTo, request.url));
  } catch (error) {
    console.error('[Refresh] Error:', error);
    await clearAuthCookies();
    return NextResponse.redirect(LOGIN_URL);
  }
}
