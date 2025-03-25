import { useTwitchMessages } from "@/hooks/use-messages";
import { cn } from "@/lib/utils";
import { Channel } from "@/state";
import { useMemo } from "react";

interface ChannelContentProps {
  channel: Channel;
}

const normalizeChannelName = (channel: string) => {
  // Ensure consistent channel name format
  return channel.toLowerCase().replace(/^#/, "");
};

export function ChannelContent({ channel }: ChannelContentProps) {
  const { messages } = useTwitchMessages(channel.name);

  const channelMessages = useMemo(() => {
    const normalizedChannel = normalizeChannelName(channel.name);
    return messages.filter(
      (msg) => normalizeChannelName(msg.channel) === normalizedChannel
    );
  }, [messages, channel.name]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {channelMessages.map((msg, index) => (
          <div key={index} className="p-2 rounded-lg bg-gray-100">
            <span
              className={cn(
                "font-medium",
                msg.tags["color"] ?? "text-foreground"
              )}
              style={{
                color: msg.tags["color"] ?? undefined,
              }}
            >
              {msg.tags["display-name"] || "Unknown"}:
            </span>
            <span className="ml-2 text-gray-800">{msg.message}</span>
          </div>
        ))}
        {channelMessages.length === 0 && (
          <div className="text-center text-gray-500 py-4">No messages yet</div>
        )}
      </div>
    </div>
  );
}
