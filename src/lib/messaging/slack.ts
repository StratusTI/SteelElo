export interface SlackMessageOptions {
  channelId: string;
  text: string;
  blocks?: SlackBlock[];
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  elements?: Array<{
    type: string;
    text?: string;
    emoji?: boolean;
  }>;
}

export interface SlackMessageResponse {
  ok: boolean;
  channel?: string;
  ts?: string;
  error?: string;
}

export async function sendSlackMessage(
  accessToken: string,
  options: SlackMessageOptions
): Promise<SlackMessageResponse> {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: options.channelId,
      text: options.text,
      blocks: options.blocks,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    console.error('Slack message error:', data.error);
  }

  return data;
}

/**
 * @deprecated Use user ID as channel for DMs instead
 */
export function getDefaultSlackChannelId(): string {
  return process.env.SLACK_DEFAULT_CHANNEL_ID || '';
}
