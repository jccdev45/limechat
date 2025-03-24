import tmi from 'tmi.js';
import { messagesAtom, isConnectedAtom } from '../state';
import { useSetAtom } from 'jotai';

interface TwitchMessage {
  user: string;
  message: string;
}

let client: tmi.Client | null = null;

// Function to initialize the Twitch client
export const connectToTwitch = async (username: string, token: string): Promise<void> => {
  const setMessages = useSetAtom(messagesAtom);
  const setIsConnected = useSetAtom(isConnectedAtom);

  client = new tmi.Client({
    identity: {
      username,
      password: `oauth:${token}`,
    },
    channels: [username],
  });

  client.on('message', (channel: string, tags: tmi.ChatUserstate, message: string, self: boolean) => {
    if (self || !tags.username) return;
    setMessages((prev: TwitchMessage[]) => [...prev, { user: tags.username || 'Unknown', message }]);
  });

  client.on('connected', () => {
    setIsConnected(true);
  });

  client.on('disconnected', () => {
    setIsConnected(false);
  });

  await client.connect();
};

// Function to disconnect from Twitch
export const disconnectFromTwitch = async (): Promise<void> => {
  if (client) {
    await client.disconnect();
    client = null;
  }
};