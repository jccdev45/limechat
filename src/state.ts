import { atom } from 'jotai';
import { atomWithStorage } from "jotai/utils"
import type { ChatUserstate } from 'tmi.js';

export interface Channel {
  name: string;
  connected: boolean;
  messages: { user: string; message: string }[];
}

export interface Credentials {
  username: string;
  token: string;
}

export interface Message {
  message: string;
  channel: string;
  tags: ChatUserstate
  self: boolean
}

export const activeChannelAtom = atomWithStorage<string | null>('activeChannel', null);
export const channelsAtom = atomWithStorage<Channel[]>('channels', []);
export const credentialsAtom = atom<Credentials | null>(null);
export const errorAtom = atom<string | null>(null);
export const isConnectedAtom = atom(false);
export const messagesAtom = atom<Message[]>([]);
