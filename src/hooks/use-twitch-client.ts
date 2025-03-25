import {
  channelsAtom,
  credentialsAtom,
  errorAtom,
  isConnectedAtom,
  messagesAtom,
} from "@/state";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ChatUserstate, Client } from "tmi.js";

export const useTwitchClient = () => {
  const channels = useAtomValue(channelsAtom);
  const credentials = useAtomValue(credentialsAtom);
  const setMessages = useSetAtom(messagesAtom);
  const setIsConnected = useSetAtom(isConnectedAtom);
  const setError = useSetAtom(errorAtom);
  const clientRef = useRef<Client | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  // Create stable connection key
  const connectionKey = useMemo(() => {
    const channelKey = channels
      .map((c) => c.name.toLowerCase())
      .sort()
      .join(',');
    const credKey = credentials ? `${credentials.username}:${credentials.token}` : 'anon';
    return `${channelKey}|${credKey}`;
  }, [channels, credentials]);

  // Handle proper disconnection
  const disconnectClient = useCallback(async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.disconnect();
      } catch (error) {
        console.debug('Disconnection error:', error);
      }
      clientRef.current = null;
      setIsConnected(false);
    }
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, [setIsConnected]);

  useEffect(() => {
    const connectClient = async () => {
      await disconnectClient();

      if (channels.length === 0) return;

      const client = new Client({
        channels: channels.map((c) => c.name.toLowerCase()),
        identity: credentials
          ? {
              username: credentials.username,
              password: `oauth:${credentials.token}`,
            }
          : undefined,
        connection: {
          reconnect: true,
          maxReconnectAttempts: 3,
        },
        options: { debug: true }
      });

      const handleMessage = (
        channel: string,
        tags: ChatUserstate,
        message: string,
        self: boolean
      ) => {
        setMessages((prev) => [...prev, { channel, tags, message, self }]);
      };

      client.on('connected', () => {
        setIsConnected(true);
        setError(null);
      });

      client.on('message', handleMessage);

      client.on('disconnected', (reason) => {
        setIsConnected(false);
        if (!reason.includes('closed')) {
          setError(`Disconnected: ${reason}`);
          reconnectTimer.current = setTimeout(connectClient, 5000);
        }
      });

      try {
        await client.connect();
        clientRef.current = client;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Connection failed');
        clientRef.current = null;
        reconnectTimer.current = setTimeout(connectClient, 5000);
      }
    };

    connectClient();

    return () => {
      disconnectClient();
    };
  }, [connectionKey, disconnectClient, setMessages, setIsConnected, setError]);

  const sendMessage = useCallback(
    async (channel: string, message: string) => {
      if (clientRef.current) {
        try {
          await clientRef.current.say(channel, message);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Message send failed');
        }
      }
    },
    [setError]
  );

  return {
    sendMessage,
    isConnected: useAtomValue(isConnectedAtom),
    messages: useAtomValue(messagesAtom),
    error: useAtomValue(errorAtom),
  };
};
