// components/message-input.tsx
import { useAtom } from 'jotai';
import { credentialsAtom } from '../state';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Smile, Send } from 'lucide-react';
import { useState } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [credentials] = useAtom(credentialsAtom);
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="flex items-center p-2 border-t">
      <Input
        placeholder="Type a message..."
        disabled={!credentials}
        className="flex-1 mr-2"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <Button variant="ghost" size="sm" disabled={!credentials}>
        <Smile className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" disabled={!credentials} onClick={handleSend}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}