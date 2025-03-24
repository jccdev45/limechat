import { ChannelContent } from "@/components/channel-content";
import { ChannelTabs } from "@/components/channel-tabs";
import { MessageInput } from "@/components/message-input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  activeChannelAtom,
  channelsAtom
} from "@/state";
import { useAtom } from "jotai";
import "./App.css";
import { useTwitchClient } from "./hooks/use-twitch-client";

export default function App() {
  const [channels, setChannels] = useAtom(channelsAtom);
  const [activeChannel, setActiveChannel] = useAtom(activeChannelAtom);
  const client = useTwitchClient();

  const handleSendMessage = (message: string) => {
    if (activeChannel) {
      setChannels((prev) =>
        prev.map((channel) =>
          channel.name === activeChannel
            ? {
                ...channel,
                messages: [...channel.messages, { user: "You", message }],
              }
            : channel
        )
      );
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Tabs
        value={activeChannel || ""}
        onValueChange={setActiveChannel}
        className="flex flex-col flex-1"
      >
        <ChannelTabs />
        {channels.map((channel) => (
          <TabsContent
            key={channel.name}
            value={channel.name}
            className="flex-1"
          >
            <ChannelContent channel={channel} />
          </TabsContent>
        ))}
      </Tabs>
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
