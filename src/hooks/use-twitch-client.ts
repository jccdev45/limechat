// use-twitch-connection.ts
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { Client } from "tmi.js";
import {
  channelsAtom,
  credentialsAtom,
  errorAtom,
  isConnectedAtom,
} from "@/state";

let twitchClient: Client | null = null;

const connectClient = async (
  channels: string[],
  credentials: { username: string; token: string } | null,
  setIsConnected: (connected: boolean) => void,
  setError: (error: string | null) => void
) => {
  if (twitchClient && twitchClient.readyState() === "OPEN") return;

  if (!twitchClient) {
    twitchClient = new Client({
      channels: channels.map((c) => c.toLowerCase()),
      identity: credentials ? {
        username: credentials.username,
        password: `oauth:${credentials.token}`,
      } : undefined,
      connection: {
        reconnect: true,
        maxReconnectAttempts: 3,
      },
      options: { debug: true },
    });

    twitchClient.on('connected', () => {
      setIsConnected(true);
      setError(null);
    });

    twitchClient.on('disconnected', (reason) => {
      setIsConnected(false);
      if (!reason.includes('closed')) {
        setError(`Disconnected: ${reason}`);
      }
    });
  }

  try {
    await twitchClient.connect();
  } catch (error) {
    setError(error instanceof Error ? error.message : "Connection failed");
    twitchClient = null;
  }
};

export const useTwitchClient = () => {
  const channels = useAtomValue(channelsAtom);
  const credentials = useAtomValue(credentialsAtom);
  const setIsConnected = useSetAtom(isConnectedAtom);
  const setError = useSetAtom(errorAtom);

  useEffect(() => {
    if (channels.length > 0 && !twitchClient) {
      connectClient(channels.map((c) => c.name), credentials, setIsConnected, setError);
    }

    return () => {
      // Only disconnect on explicit unmount
      if (process.env.NODE_ENV === 'production' || !twitchClient) {
        if (twitchClient) {
          twitchClient.disconnect();
          twitchClient = null;
        }
      }
    };
  }, [channels, credentials, setIsConnected, setError]);

  const sendMessage = useCallback(
    async (channel: string, message: string) => {
      if (!twitchClient) {
        setError("Not connected to Twitch chat");
        return false;
      }

      try {
        await twitchClient.say(channel, message);
        return true;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to send message"
        );
        return false;
      }
    },
    [setError]
  );

  return {
    client: twitchClient,
    sendMessage,
    isConnected: useAtomValue(isConnectedAtom),
    error: useAtomValue(errorAtom),
  };
};
