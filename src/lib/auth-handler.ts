// src/lib/auth-handler.ts
import { atomWithStorage } from 'jotai/utils';
import type { Credentials } from '@/state';
import { getTwitchAuthUrl } from './twitch-auth';
import { openUrl } from '@tauri-apps/plugin-opener';

export const credentialsAtom = atomWithStorage<Credentials | null>('twitchCredentials', null);

export const handleTwitchLogin = async () => {
  const url = getTwitchAuthUrl();
  try {
    await openUrl(url);
  } catch (error) {
    console.error('Failed to open Twitch login:', error);
    // Fallback to window.open if openUrl fails
    window.open(url, '_blank');
  }
};

// This would be called when the callback route is hit
export const handleTwitchCallback = (code: string) => {
  // Exchange the code for a token (you'll need to implement this API call)
  // For now, we'll just store the code
  return {
    username: 'placeholder', // This would be the actual username from the API
    token: code
  };
};