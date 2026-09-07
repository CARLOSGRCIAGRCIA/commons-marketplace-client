import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockAuthState: { user: any; isAuthenticated: boolean } = {
  user: null,
  isAuthenticated: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthState.user = null;
  mockAuthState.isAuthenticated = false;
});

async function importWidget() {
  vi.resetModules();

  const mockApiClient = { get: vi.fn(), post: vi.fn() };

  vi.doMock('@/store/auth-store', () => ({
    useAuthStore: Object.assign(vi.fn(() => mockAuthState), {
      getState: vi.fn(() => mockAuthState),
      setState: vi.fn(),
    }),
  }));

  vi.doMock('@/lib/api', () => ({
    apiClient: mockApiClient,
    API_ENDPOINTS: {
      chat: {
        conversations: '/api/chat/conversations',
        messages: (id: string) => `/api/chat/messages/${id}`,
        sendMessage: '/api/chat/send',
        getOrCreateConversation: (id: string) => `/api/chat/conversation/${id}`,
      },
      users: { get: (id: string) => `/api/users/${id}` },
    },
  }));

  vi.doMock('@/lib/socket', () => ({
    connectSocket: vi.fn(),
    joinConversation: vi.fn(),
    leaveConversation: vi.fn(),
    onNewMessage: vi.fn(() => vi.fn()),
  }));

  const mod = await import('@/components/chat/chat-widget');
  return { ChatWidget: mod.ChatWidget, apiClient: mockApiClient };
}

describe('ChatWidget', () => {
  it('returns null when not authenticated', async () => {
    mockAuthState.isAuthenticated = false;
    const { ChatWidget } = await importWidget();
    const { container } = render(<ChatWidget />);
    expect(container.innerHTML).toBe('');
  });

  it('shows FAB button when authenticated and chat is closed', async () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = { _id: 'u1', name: 'Test', email: 'test@test.com', role: 'buyer' };
    const { ChatWidget } = await importWidget();
    render(<ChatWidget />);
    expect(screen.getByRole('button', { name: 'Abrir chat' })).toBeInTheDocument();
  });

  it('has "Abrir chat" aria-label on FAB', async () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = { _id: 'u1', name: 'Test', email: 'test@test.com', role: 'buyer' };
    const { ChatWidget } = await importWidget();
    render(<ChatWidget />);
    const fab = screen.getByRole('button', { name: 'Abrir chat' });
    expect(fab).toHaveAttribute('aria-label', 'Abrir chat');
  });

  it('opens chat panel when clicking FAB', async () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = { _id: 'u1', name: 'Test', email: 'test@test.com', role: 'buyer' };
    const { ChatWidget, apiClient } = await importWidget();
    apiClient.get.mockResolvedValue({ data: { conversations: [] } });

    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByRole('button', { name: 'Abrir chat' }));

    await waitFor(() => {
      expect(screen.getByText('Mensajes')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Abrir chat' })).not.toBeInTheDocument();
  });

  it('shows empty state "Sin conversaciones" when no conversations', async () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = { _id: 'u1', name: 'Test', email: 'test@test.com', role: 'buyer' };
    const { ChatWidget, apiClient } = await importWidget();
    apiClient.get.mockResolvedValue({ data: { conversations: [] } });

    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole('button', { name: 'Abrir chat' }));

    await waitFor(() => {
      expect(screen.getByText('Sin conversaciones')).toBeInTheDocument();
    });
  });

  it('shows conversation list when conversations exist', async () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = { _id: 'u1', name: 'Test', email: 'test@test.com', role: 'buyer' };
    const { ChatWidget, apiClient } = await importWidget();
    apiClient.get.mockResolvedValue({
      data: {
        conversations: [
          {
            _id: 'conv1',
            participants: [
              { _id: 'u1', name: 'Test', email: 'test@test.com' },
              { _id: 'u2', name: 'Maria Lopez', email: 'maria@test.com' },
            ],
            lastMessage: { content: 'Hola', createdAt: new Date().toISOString() },
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    });

    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole('button', { name: 'Abrir chat' }));

    await waitFor(() => {
      expect(screen.getByText('Maria Lopez')).toBeInTheDocument();
    });
  });

  it('shows "Cerrar" button to close chat', async () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = { _id: 'u1', name: 'Test', email: 'test@test.com', role: 'buyer' };
    const { ChatWidget, apiClient } = await importWidget();
    apiClient.get.mockResolvedValue({ data: { conversations: [] } });

    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole('button', { name: 'Abrir chat' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Abrir chat' })).toBeInTheDocument();
    });
  });

  it('shows "Mensajes" header with conversation count', async () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = { _id: 'u1', name: 'Test', email: 'test@test.com', role: 'buyer' };
    const { ChatWidget, apiClient } = await importWidget();
    apiClient.get.mockResolvedValue({ data: { conversations: [] } });

    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole('button', { name: 'Abrir chat' }));

    await waitFor(() => {
      expect(screen.getByText('Mensajes')).toBeInTheDocument();
    });

    const header = screen.getByText('Mensajes').closest('div');
    expect(header).toHaveTextContent(/conversación/);
  });

  it('renders initials from participant names (getInitials)', async () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = { _id: 'u1', name: 'Test', email: 'test@test.com', role: 'buyer' };
    const { ChatWidget, apiClient } = await importWidget();
    apiClient.get.mockResolvedValue({
      data: {
        conversations: [
          {
            _id: 'conv1',
            participants: [
              { _id: 'u1', name: 'Test', email: 'test@test.com' },
              { _id: 'u2', name: 'John', email: 'john@test.com' },
            ],
            lastMessage: { content: 'Hi', createdAt: new Date().toISOString() },
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'conv2',
            participants: [
              { _id: 'u1', name: 'Test', email: 'test@test.com' },
              { _id: 'u3', name: 'Maria Lopez', email: 'maria@test.com' },
            ],
            lastMessage: { content: 'Hola', createdAt: new Date().toISOString() },
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    });

    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole('button', { name: 'Abrir chat' }));

    await waitFor(() => {
      expect(screen.getByText('J')).toBeInTheDocument();
      expect(screen.getByText('ML')).toBeInTheDocument();
    });
  });

  it('shows loading skeleton while fetching messages', async () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = { _id: 'u1', name: 'Test', email: 'test@test.com', role: 'buyer' };
    const { ChatWidget, apiClient } = await importWidget();

    apiClient.get
      .mockResolvedValueOnce({
        data: {
          conversations: [
            {
              _id: 'conv1',
              participants: [
                { _id: 'u1', name: 'Test', email: 'test@test.com' },
                { _id: 'u2', name: 'John', email: 'john@test.com' },
              ],
              lastMessage: { content: 'Hi', createdAt: new Date().toISOString() },
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      })
      .mockImplementationOnce(() => new Promise(() => {}));

    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole('button', { name: 'Abrir chat' }));

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    await user.click(screen.getByText('John'));

    await waitFor(() => {
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});
