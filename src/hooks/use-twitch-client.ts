import {
  channelsAtom,
  credentialsAtom,
  errorAtom,
  isConnectedAtom,
  messagesAtom,
} from "@/state";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { ChatUserstate, Client } from "tmi.js";

export const useTwitchClient = () => {
  const channels = useAtomValue(channelsAtom);
  const credentials = useAtomValue(credentialsAtom);
  const setMessages = useSetAtom(messagesAtom);
  const setIsConnected = useSetAtom(isConnectedAtom);
  const setError = useSetAtom(errorAtom);
  const clientRef = useRef<Client | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const isConnecting = useRef(false);

  const handleMessage = useCallback(
    (channel: string, tags: ChatUserstate, message: string, self: boolean) => {
      const normalizedChannel = channel.replace(/^#/, "");
      setMessages((prev) => [
        ...prev,
        {
          channel: normalizedChannel,
          tags,
          message,
          self,
        },
      ]);
    },
    [setMessages]
  );

  const disconnectClient = useCallback(async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.disconnect();
      } catch (error) {
        console.debug("Disconnection error:", error);
      }
      clientRef.current = null;
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
        (clientRef.current && clientRef.current.readyState() === "OPEN")
      ) {
        return;
      }

      isConnecting.current = true;

      await disconnectClient();

      if (channels.length === 0) {
        isConnecting.current = false;
        return;
      }

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
        options: { debug: true },
      });

      client.on("connected", onConnected);
      client.on("message", handleMessage);
      client.on("disconnected", onDisconnected);

      try {
        await client.connect();
        clientRef.current = client;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Connection failed");
        clientRef.current = null;
        isConnecting.current = false;
        reconnectTimer.current = setTimeout(connectClient, 5000);
      }
    };

    const onConnected = () => {
      setIsConnected(true);
      setError(null);
      isConnecting.current = false;
    };

    const onDisconnected = (reason: string) => {
      setIsConnected(false);
      isConnecting.current = false;
      if (!reason.includes("closed")) {
        setError(`Disconnected: ${reason}`);
        reconnectTimer.current = setTimeout(connectClient, 5000);
      }
    };

    connectClient();

    return () => {
      if (clientRef.current) {
        clientRef.current.removeListener("connected", onConnected);
        clientRef.current.removeListener("message", handleMessage);
        clientRef.current.removeListener("disconnected", onDisconnected);
      }
      disconnectClient();
    };
  }, [
    channels,
    credentials,
    disconnectClient,
    handleMessage,
    setError,
    setIsConnected,
  ]);

  const sendMessage = useCallback(
    async (channel: string, message: string) => {
      if (clientRef.current) {
        try {
          await clientRef.current.say(channel, message);
        } catch (error) {
          setError(
            error instanceof Error ? error.message : "Message send failed"
          );
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
