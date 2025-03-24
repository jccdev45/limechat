import { atom } from 'jotai';
import { atomWithStorage } from "jotai/utils"

export interface Channel {
    name: string;
    connected: boolean;
    messages: { user: string; message: string }[];
}

interface Credentials {
    username: string;
    token: string;
}

export const channelsAtom = atomWithStorage<Channel[]>('channels', []);
export const activeChannelAtom = atomWithStorage<string | null>('activeChannel', null);
export const messagesAtom = atom<{ user: string; message: string }[]>([]);
export const isConnectedAtom = atom(false);
export const credentialsAtom = atom<Credentials | null>(null);
