import type { Conversation } from './index';

export interface ChatMessage {
  _id: string;
  id?: string;
  content: string;
  senderId: string;
  sender?: { id: string };
  receiver?: { id: string };
  receiverId: string;
  createdAt: string;
}

export interface ParticipantLike {
  _id?: string;
  id?: string;
  name?: string;
  lastName?: string;
  email?: string;
  profilePicUrl?: string;
  role?: string;
}

export interface ConversationRef {
  _id?: string;
  id?: string;
  lastMessage?: Conversation['lastMessage'];
  updatedAt?: string;
  createdAt?: string;
}

export interface IncomingSocketMessage {
  _id?: string;
  id?: string;
  content?: string;
  senderId?: string;
  sender?: { id?: string };
  receiverId?: string;
  createdAt?: string;
}
