// use-twitch-connection.ts
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { Client } from "tmi.js";
import {
  channelsAtom,
  credentialsAtom,
  errorAtom,
  isConnectedAtom,
} from "@/state";

let twitchClient: Client | null = null;

export const useTwitchClient = () => {
  const channels = useAtomValue(channelsAtom);
  const credentials = useAtomValue(credentialsAtom);
  const setIsConnected = useSetAtom(isConnectedAtom);
  const setError = useSetAtom(errorAtom);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const isConnecting = useRef(false);

  const disconnectClient = useCallback(async () => {
    if (twitchClient) {
      try {
        await twitchClient.disconnect();
      } catch (error) {
        console.debug("Disconnection error:", error);
      }
      twitchClient = null;
      setIsConnected(false);
      isConnecting.current = false;
    }
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, [setIsConnected]);

  useEffect(() => {
    const connectClient = async () => {
      if (
        isConnecting.current ||
        (twitchClient && twitchClient.readyState() === "OPEN")
      ) {
        return;
      }

      isConnecting.current = true;

      await disconnectClient();

      if (channels.length === 0) {
        isConnecting.current = false;
        return;
      }

      if (!twitchClient) {
        twitchClient = new Client({
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
          options: { debug: true },
        });

        twitchClient.on("connected", () => {
          setIsConnected(true);
          setError(null);
          isConnecting.current = false;
        });

        twitchClient.on("disconnected", (reason) => {
          setIsConnected(false);
          isConnecting.current = false;
          if (!reason.includes("closed")) {
            setError(`Disconnected: ${reason}`);
            reconnectTimer.current = setTimeout(connectClient, 5000);
          }
        });
      }

      try {
        await twitchClient.connect();
      } catch (error) {
        setError(error instanceof Error ? error.message : "Connection failed");
        twitchClient = null;
        isConnecting.current = false;
        reconnectTimer.current = setTimeout(connectClient, 5000);
      }
    };

    connectClient();

    return () => {
      if (twitchClient) {
        disconnectClient();
      }
    };
  }, [channels, credentials, disconnectClient, setError, setIsConnected]);

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
