import type { OAuthUserInfo } from '../oauth/providers';
import { getDefaultSlackChannelId, sendSlackMessage } from './slack';
import { getDefaultTeamsConfig, sendTeamsMessage } from './teams';
import { getWelcomeMessage } from './welcome-message';

export * from './slack';
export * from './teams';
export * from './welcome-message';

export async function sendWelcomeNotification(
  provider: 'slack' | 'teams',
  accessToken: string,
  userInfo: OAuthUserInfo
): Promise<boolean> {
  try {
    const message = getWelcomeMessage(userInfo, provider);

    if (provider === 'slack') {
      // Envia DM para o usuário usando o ID dele como channel
      // Isso funciona em qualquer workspace sem precisar configurar canal
      if (!userInfo.id) {
        console.warn('Slack user ID not available for DM');
        return false;
      }

      const result = await sendSlackMessage(accessToken, {
        channelId: userInfo.id, // User ID funciona como channel para DM
        text: message.text,
        blocks: message.slackBlocks,
      });

      return result.ok;
    }

    if (provider === 'teams') {
      // Para Teams, também podemos enviar chat direto ao usuário
      // Por enquanto, mantém a lógica de canal configurável
      const { teamId, channelId } = getDefaultTeamsConfig();
      if (!teamId || !channelId) {
        console.warn('TEAMS_DEFAULT_TEAM_ID or TEAMS_DEFAULT_CHANNEL_ID not configured');
        return false;
      }

      const result = await sendTeamsMessage(accessToken, {
        teamId,
        channelId,
        content: message.teamsHtml || message.text,
      });

      return !result.error;
    }

    return false;
  } catch (error) {
    console.error(`Failed to send welcome notification via ${provider}:`, error);
    return false;
  }
}
