// components/channel-content.tsx

import { Channel } from "@/state";

interface ChannelContentProps {
  channel: Channel;
}

export function ChannelContent({ channel }: ChannelContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {channel.messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.user}:</strong> {msg.message}
          </div>
        ))}
      </div>
    </div>
  );
}