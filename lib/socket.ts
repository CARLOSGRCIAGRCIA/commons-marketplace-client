'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000';

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const connectSocket = (userId: string): void => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
    socket.emit('authenticate', userId);
  }
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const joinConversation = (conversationId: string): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('join-room', `chat:${conversationId}`);
  }
};

export const leaveConversation = (conversationId: string): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('leave-room', `chat:${conversationId}`);
  }
};

export const sendTyping = (conversationId: string): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('typing', { room: `chat:${conversationId}` });
  }
};

export const stopTyping = (conversationId: string): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('stop-typing', { room: `chat:${conversationId}` });
  }
};

export interface IncomingSocketMessage {
  _id?: string;
  id?: string;
  content?: string;
  senderId?: string;
  sender?: { id?: string };
  receiverId?: string;
  createdAt?: string;
}

export const onNewMessage = (
  callback: (data: { message: IncomingSocketMessage; conversationId: string }) => void
): (() => void) => {
  const socket = getSocket();
  socket.on('new-message', callback);
  return () => {
    socket.off('new-message', callback);
  };
};

export const onUserTyping = (callback: (data: { userId: string; room: string }) => void): (() => void) => {
  const socket = getSocket();
  socket.on('user-typing', callback);
  return () => {
    socket.off('user-typing', callback);
  };
};

export const onUserStopTyping = (callback: (data: { userId: string; room: string }) => void): (() => void) => {
  const socket = getSocket();
  socket.on('user-stop-typing', callback);
  return () => {
    socket.off('user-stop-typing', callback);
  };
};
