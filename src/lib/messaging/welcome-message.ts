import type { OAuthUserInfo } from '../oauth/providers';
import type { SlackBlock } from './slack';

export interface WelcomeMessageContent {
  text: string;
  slackBlocks?: SlackBlock[];
  teamsHtml?: string;
}

export function getWelcomeMessage(
  userInfo: OAuthUserInfo,
  provider: 'slack' | 'teams'
): WelcomeMessageContent {
  const userName = userInfo.name || userInfo.login;
  const appName = 'Nexo';

  const text = `${userName} acabou de se conectar ao ${appName}! Seja bem-vindo(a)!`;

  if (provider === 'slack') {
    return {
      text,
      slackBlocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:wave: *${userName}* acabou de se conectar ao *${appName}*!`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Seja bem-vindo(a) à equipe! Estamos felizes em ter você conosco.`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `:email: ${userInfo.email || 'Email não informado'}`,
            },
          ],
        },
      ],
    };
  }

  // Teams - usando HTML
  return {
    text,
    teamsHtml: `
      <p><strong>${userName}</strong> acabou de se conectar ao <strong>${appName}</strong>!</p>
      <p>Seja bem-vindo(a) à equipe! Estamos felizes em ter você conosco.</p>
      <p><em>${userInfo.email || ''}</em></p>
    `.trim(),
  };
}
