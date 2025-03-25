import { useTwitchClient } from "@/hooks/use-twitch-client";
import { Channel } from "@/state";

interface ChannelContentProps {
  channel: Channel;
}

export function ChannelContent({ channel }: ChannelContentProps) {
  const { messages } = useTwitchClient();

  // Filter messages for this specific channel
  const channelMessages = messages.filter(
    (msg) => msg.channel === channel.name
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length > 0 ? channelMessages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.tags["display-name"]}:</strong> {msg.message}
          </div>
        )) : <div className="text-center">No messages yet</div>}
      </div>
    </div>
  );
}
