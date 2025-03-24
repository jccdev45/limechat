import { useAtom } from 'jotai';
import { messagesAtom, isConnectedAtom, credentialsAtom } from '../state';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { connectToTwitch, disconnectFromTwitch } from '@/services/twitch';



export function Chat() {
  const [credentials, setCredentials] = useAtom(credentialsAtom);
  const [messages] = useAtom(messagesAtom);
  const [isConnected] = useAtom(isConnectedAtom);

  const handleConnect = async () => {
    if (credentials?.username && credentials?.token) {
      await connectToTwitch(credentials.username, credentials.token);
    }
  };

  const handleDisconnect = async () => {
    await disconnectFromTwitch();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...(prev || { username: '', token: '' }),
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-grow overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.user}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <Input
          name="username"
          placeholder="Username"
          value={credentials?.username || ''}
          onChange={handleInputChange}
        />
        <Input
          name="token"
          placeholder="Token"
          value={credentials?.token || ''}
          onChange={handleInputChange}
        />
        {isConnected ? (
          <Button onClick={handleDisconnect}>Disconnect</Button>
        ) : (
          <Button onClick={handleConnect}>Connect</Button>
        )}
      </div>
    </div>
  );
};
