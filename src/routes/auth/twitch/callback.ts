// src/routes/auth/twitch/callback.ts
import { handleTwitchCallback } from '@/lib/auth-handler';

export default function TwitchCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (code) {
    // Get the credentials from the callback
    const credentials = handleTwitchCallback(code);
    
    // Store credentials in localStorage
    localStorage.setItem('twitchCredentials', JSON.stringify(credentials));
    
    // Close the current window and return to the main app
    if (window.opener) {
      window.opener.location.reload(); // Refresh the main window
      window.close(); // Close the callback window
    } else {
      // If we're not in a popup, redirect back to the main app
      window.location.href = '/';
    }
  } else {
    console.error('No code received from Twitch');
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/';
    }
  }
}