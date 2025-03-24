// components/channel-tabs.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { activeChannelAtom, channelsAtom } from '@/state';
import { useAtom } from 'jotai';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

export function ChannelTabs() {
  const [channels, setChannels] = useAtom(channelsAtom);
  const [activeChannel, setActiveChannel] = useAtom(activeChannelAtom);
  const [newChannelName, setNewChannelName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddChannel = () => {
    if (newChannelName.trim()) {
      setChannels((prev) => [
        ...prev,
        { name: newChannelName, connected: false, messages: [] },
      ]);
      setActiveChannel(newChannelName);
      setNewChannelName('');
      setIsDialogOpen(false);
    }
  };

  const handleRemoveChannel = (channelName: string) => {
    setChannels((prev) => prev.filter((channel) => channel.name !== channelName));
    if (activeChannel === channelName) {
      setActiveChannel(channels[0]?.name || null);
    }
  };

  return (
    <div className="flex justify-between items-center p-2 border-b">
      <TabsList>
        {channels.length ? channels.map((channel) => (
          <TabsTrigger key={channel.name} value={channel.name} className='cursor-pointer' asChild>
            <div className="group flex items-center">
              <span>{channel.name}</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the channel and its messages.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRemoveChannel(channel.name)}>
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsTrigger>
        )) : <div className="flex-1 items-center justify-center">
          <span className="text-muted-foreground">No channels</span>
        </div>}
      </TabsList>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Channel</DialogTitle>
            <DialogDescription>
              Enter the name of the channel you want to add.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="Channel name"
            onKeyDown={(e) => e.key === 'Enter' && handleAddChannel()}
          />
          <DialogFooter>
            <Button onClick={handleAddChannel}>Add Channel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}