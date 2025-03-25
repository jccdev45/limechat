// use-twitch-messages.ts
import { useTwitchClient } from "@/hooks/use-twitch-client";
import { messagesAtom } from "@/state";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { ChatUserstate } from "tmi.js";

export const useTwitchMessages = (channel: string) => {
  const { client } = useTwitchClient();
  const [messages, setMessages] = useAtom(messagesAtom);

  const handleMessage = useCallback(
    (
      channelName: string,
      tags: ChatUserstate,
      message: string,
      self: boolean
    ) => {
      if (self || channelName.slice(1).toLowerCase() !== channel.toLowerCase())
        return;

      const normalizedChannel = channelName.replace(/^#/, "");
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
    [channel, setMessages]
  );

  useEffect(() => {
    if (!client) return;

    client.on("message", handleMessage);
    return () => {
      client.removeListener("message", handleMessage);
    };
  }, [client, handleMessage]);

  return {
    messages: messages.filter(
      (msg) => msg.channel.toLowerCase() === channel.toLowerCase()
    ),
  };
};
