interface TwitchAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string[];
}

// src/lib/twitch-auth.ts
export const twitchAuthConfig: TwitchAuthConfig = {
  clientId: import.meta.env.VITE_TWITCH_CLIENT_ID!,
  redirectUri: 'https://07b1-108-21-151-241.ngrok-free.app/api/auth/twitch/callback', // Use your ngrok URL
  scope: ['chat:read', 'chat:edit'],
};

export const getTwitchAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: twitchAuthConfig.clientId,
    redirect_uri: twitchAuthConfig.redirectUri,
    response_type: 'code',
    scope: twitchAuthConfig.scope.join(' '),
  });

  return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
};
