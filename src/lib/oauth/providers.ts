export type OAuthProvider = 'github' | 'gitlab' | 'slack' | 'teams';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  redirectUri: string;
}

export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
  scope?: string;
}

export interface OAuthUserInfo {
  id: string;
  login: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function getOAuthConfig(provider: OAuthProvider): OAuthConfig {
  switch (provider) {
    case 'github':
      return {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        authorizeUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user',
        scopes: ['read:user', 'user:email', 'repo'],
        redirectUri: `${BASE_URL}/api/integrations/github/callback`,
      };

    case 'gitlab':
      return {
        clientId: process.env.GITLAB_CLIENT_ID || '',
        clientSecret: process.env.GITLAB_CLIENT_SECRET || '',
        authorizeUrl: 'https://gitlab.com/oauth/authorize',
        tokenUrl: 'https://gitlab.com/oauth/token',
        userInfoUrl: 'https://gitlab.com/api/v4/user',
        scopes: ['read_user', 'read_api', 'read_repository'],
        redirectUri: `${BASE_URL}/api/integrations/gitlab/callback`,
      };

    case 'slack':
      return {
        clientId: process.env.SLACK_CLIENT_ID || '',
        clientSecret: process.env.SLACK_CLIENT_SECRET || '',
        authorizeUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
        userInfoUrl: 'https://slack.com/api/users.identity',
        scopes: ['chat:write', 'channels:read', 'users:read', 'identity.basic'],
        redirectUri: `${BASE_URL}/api/integrations/slack/callback`,
      };

    case 'teams':
      return {
        clientId: process.env.TEAMS_CLIENT_ID || '',
        clientSecret: process.env.TEAMS_CLIENT_SECRET || '',
        authorizeUrl: `https://login.microsoftonline.com/${process.env.TEAMS_TENANT_ID || 'common'}/oauth2/v2.0/authorize`,
        tokenUrl: `https://login.microsoftonline.com/${process.env.TEAMS_TENANT_ID || 'common'}/oauth2/v2.0/token`,
        userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
        scopes: ['Chat.ReadWrite', 'ChannelMessage.Send', 'User.Read', 'offline_access'],
        redirectUri: `${BASE_URL}/api/integrations/teams/callback`,
      };

    default:
      throw new Error(`Unknown OAuth provider: ${provider}`);
  }
}

export function generateAuthUrl(provider: OAuthProvider, state: string): string {
  const config = getOAuthConfig(provider);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state,
    response_type: 'code',
  });

  // Slack usa 'scope' para bot scopes e 'user_scope' para user scopes
  if (provider === 'slack') {
    params.set('scope', config.scopes.filter(s => !s.startsWith('identity.')).join(','));
    params.set('user_scope', config.scopes.filter(s => s.startsWith('identity.')).join(','));
  } else {
    params.set('scope', config.scopes.join(' '));
  }

  return `${config.authorizeUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  provider: OAuthProvider,
  code: string
): Promise<OAuthTokenResponse> {
  const config = getOAuthConfig(provider);

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
  });

  if (provider === 'gitlab' || provider === 'teams') {
    params.append('grant_type', 'authorization_code');
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  const data = await response.json();

  if (provider === 'github') {
    if (data.error) {
      throw new Error(data.error_description || data.error);
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  if (provider === 'slack') {
    if (!data.ok) {
      throw new Error(data.error || 'Slack OAuth failed');
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: 'Bearer',
      scope: data.scope,
    };
  }

  // GitLab and Teams
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
    scope: data.scope,
  };
}

export async function getUserInfo(
  provider: OAuthProvider,
  accessToken: string
): Promise<OAuthUserInfo> {
  const config = getOAuthConfig(provider);

  const response = await fetch(config.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const data = await response.json();

  if (provider === 'github') {
    return {
      id: String(data.id),
      login: data.login,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
    };
  }

  if (provider === 'slack') {
    if (!data.ok) {
      throw new Error(data.error || 'Failed to fetch Slack user info');
    }
    return {
      id: data.user?.id || data.user_id,
      login: data.user?.name || data.user?.email?.split('@')[0] || 'slack_user',
      name: data.user?.name,
      email: data.user?.email,
      avatarUrl: data.user?.image_72,
    };
  }

  if (provider === 'teams') {
    return {
      id: data.id,
      login: data.userPrincipalName?.split('@')[0] || data.displayName,
      name: data.displayName,
      email: data.mail || data.userPrincipalName,
      avatarUrl: undefined, // Teams requires separate Graph API call for photo
    };
  }

  // GitLab
  return {
    id: String(data.id),
    login: data.username,
    name: data.name,
    email: data.email,
    avatarUrl: data.avatar_url,
  };
}

export async function revokeToken(
  provider: OAuthProvider,
  accessToken: string
): Promise<boolean> {
  try {
    if (provider === 'github') {
      const config = getOAuthConfig(provider);
      const response = await fetch(
        `https://api.github.com/applications/${config.clientId}/token`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ access_token: accessToken }),
        }
      );
      return response.ok || response.status === 404;
    }

    if (provider === 'gitlab') {
      const response = await fetch('https://gitlab.com/oauth/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: accessToken,
          client_id: process.env.GITLAB_CLIENT_ID || '',
          client_secret: process.env.GITLAB_CLIENT_SECRET || '',
        }).toString(),
      });
      return response.ok;
    }

    if (provider === 'slack') {
      const response = await fetch('https://slack.com/api/auth.revoke', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = await response.json();
      return data.ok;
    }

    if (provider === 'teams') {
      // Microsoft doesn't have a simple revoke endpoint
      // Token will expire naturally or user can revoke from Azure portal
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function isValidProvider(provider: string): provider is OAuthProvider {
  return provider === 'github' || provider === 'gitlab' || provider === 'slack' || provider === 'teams';
}
