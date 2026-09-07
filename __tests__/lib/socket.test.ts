import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

function createMockSocket(overrides?: Partial<ReturnType<typeof createMockSocket>>) {
  return {
    connected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    ...overrides,
  };
}

async function loadSocket(mockOverrides?: Partial<ReturnType<typeof createMockSocket>>) {
  const mockSocket = createMockSocket(mockOverrides);
  vi.doMock('socket.io-client', () => ({
    io: vi.fn(() => mockSocket),
  }));
  const mod = await import('@/lib/socket');
  return { ...mod, mockSocket };
}

describe('socket', () => {
  it('should getSocket return a socket instance', async () => {
    const { getSocket, mockSocket } = await loadSocket();
    const socket = getSocket();
    expect(socket).toBe(mockSocket);
  });

  it('should return same socket on subsequent calls', async () => {
    const { getSocket } = await loadSocket();
    const s1 = getSocket();
    const s2 = getSocket();
    expect(s1).toBe(s2);
  });

  it('should connectSocket when not connected', async () => {
    const { connectSocket, mockSocket } = await loadSocket({ connected: false });
    connectSocket('user1');
    expect(mockSocket.connect).toHaveBeenCalled();
    expect(mockSocket.emit).toHaveBeenCalledWith('authenticate', 'user1');
  });

  it('should not connectSocket when already connected', async () => {
    const { connectSocket, mockSocket } = await loadSocket({ connected: true });
    connectSocket('user1');
    expect(mockSocket.connect).not.toHaveBeenCalled();
  });

  it('should disconnectSocket when connected', async () => {
    const { getSocket, disconnectSocket, mockSocket } = await loadSocket({ connected: true });
    getSocket();
    disconnectSocket();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('should not disconnectSocket when not connected', async () => {
    const { getSocket, disconnectSocket, mockSocket } = await loadSocket({ connected: false });
    getSocket();
    disconnectSocket();
    expect(mockSocket.disconnect).not.toHaveBeenCalled();
  });

  it('should joinConversation when connected', async () => {
    const { joinConversation, mockSocket } = await loadSocket({ connected: true });
    joinConversation('conv1');
    expect(mockSocket.emit).toHaveBeenCalledWith('join-room', 'chat:conv1');
  });

  it('should leaveConversation when connected', async () => {
    const { leaveConversation, mockSocket } = await loadSocket({ connected: true });
    leaveConversation('conv1');
    expect(mockSocket.emit).toHaveBeenCalledWith('leave-room', 'chat:conv1');
  });

  it('should sendTyping when connected', async () => {
    const { sendTyping, mockSocket } = await loadSocket({ connected: true });
    sendTyping('conv1');
    expect(mockSocket.emit).toHaveBeenCalledWith('typing', { room: 'chat:conv1' });
  });

  it('should stopTyping when connected', async () => {
    const { stopTyping, mockSocket } = await loadSocket({ connected: true });
    stopTyping('conv1');
    expect(mockSocket.emit).toHaveBeenCalledWith('stop-typing', { room: 'chat:conv1' });
  });

  it('should onNewMessage register and return cleanup', async () => {
    const { onNewMessage, mockSocket } = await loadSocket({ connected: true });
    const cb = vi.fn();
    const cleanup = onNewMessage(cb);
    expect(mockSocket.on).toHaveBeenCalledWith('new-message', cb);
    cleanup();
    expect(mockSocket.off).toHaveBeenCalledWith('new-message', cb);
  });

  it('should onUserTyping register and return cleanup', async () => {
    const { onUserTyping, mockSocket } = await loadSocket({ connected: true });
    const cb = vi.fn();
    const cleanup = onUserTyping(cb);
    expect(mockSocket.on).toHaveBeenCalledWith('user-typing', cb);
    cleanup();
    expect(mockSocket.off).toHaveBeenCalledWith('user-typing', cb);
  });

  it('should onUserStopTyping register and return cleanup', async () => {
    const { onUserStopTyping, mockSocket } = await loadSocket({ connected: true });
    const cb = vi.fn();
    const cleanup = onUserStopTyping(cb);
    expect(mockSocket.on).toHaveBeenCalledWith('user-stop-typing', cb);
    cleanup();
    expect(mockSocket.off).toHaveBeenCalledWith('user-stop-typing', cb);
  });

  it('should not emit when not connected', async () => {
    const { getSocket, joinConversation, leaveConversation, sendTyping, stopTyping, mockSocket } = await loadSocket({ connected: false });
    getSocket();
    joinConversation('conv1');
    leaveConversation('conv1');
    sendTyping('conv1');
    stopTyping('conv1');
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });
});
