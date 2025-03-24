import { useEffect, useRef, useCallback } from "react";
import { Client } from "tmi.js";
import {
  channelsAtom,
  credentialsAtom,
  messagesAtom,
  isConnectedAtom,
} from "@/state";
import { useAtomValue, useSetAtom } from "jotai";

export const useTwitchClient = () => {
  const channels = useAtomValue(channelsAtom);
  const credentials = useAtomValue(credentialsAtom);
  const setMessages = useSetAtom(messagesAtom);
  const setIsConnected = useSetAtom(isConnectedAtom);
  const clientRef = useRef<Client | null>(null);

  const initializeClient = useCallback(() => {
    if (clientRef.current) return;

    clientRef.current = new Client({
      options: {
        debug: true,
        joinInterval: 3000, // 3 seconds
      },
      identity: credentials
        ? {
            username: credentials.username,
            password: `oauth:${credentials.token}`,
          }
        : undefined,
      channels: channels.map((channel) => channel.name),
      connection: {
        reconnect: true,
        secure: true,
        reconnectInterval: 2500, // 2.5 seconds
        maxReconnectAttempts: 10,
      },
    });

    clientRef.current.on("message", (channel, tags, message, self) => {
      if (self || !tags.username) return;
      setMessages((prev) => [
        ...prev,
        {
          user: tags.username || "Unknown",
          message,
          channel: channel.replace("#", ""),
        },
      ]);
    });

    clientRef.current.on("connected", () => {
      console.log("Successfully connected to Twitch");
      setIsConnected(true);
    });

    clientRef.current.on("disconnected", (reason) => {
      console.log("Disconnected:", reason);
      setIsConnected(false);
    });
  }, [channels, credentials, setMessages, setIsConnected]);

  const connect = useCallback(async () => {
    if (!clientRef.current || clientRef.current.readyState() === "OPEN") return;
    try {
      await clientRef.current.connect();
    } catch (error) {
      console.error("Connection error:", error);
    }
  }, []);

  useEffect(() => {
    initializeClient();
    connect();

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, [initializeClient, connect]);

  return clientRef.current;
};
