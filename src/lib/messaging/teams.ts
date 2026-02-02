export interface TeamsMessageOptions {
  teamId: string;
  channelId: string;
  content: string;
}

export interface TeamsMessageResponse {
  id?: string;
  createdDateTime?: string;
  error?: {
    code: string;
    message: string;
  };
}

export async function sendTeamsMessage(
  accessToken: string,
  options: TeamsMessageOptions
): Promise<TeamsMessageResponse> {
  const url = `https://graph.microsoft.com/v1.0/teams/${options.teamId}/channels/${options.channelId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      body: {
        contentType: 'html',
        content: options.content,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Teams message error:', data.error);
  }

  return data;
}

export function getDefaultTeamsConfig(): { teamId: string; channelId: string } {
  return {
    teamId: process.env.TEAMS_DEFAULT_TEAM_ID || '',
    channelId: process.env.TEAMS_DEFAULT_CHANNEL_ID || '',
  };
}
