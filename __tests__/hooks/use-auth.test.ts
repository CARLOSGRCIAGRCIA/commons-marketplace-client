import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth, useRequireAuth, useRequireRole } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush, back: vi.fn(), refresh: vi.fn() })),
  usePathname: vi.fn(() => '/dashboard'),
}));

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
});

describe('useAuth', () => {
  it('should return user and auth state from store', () => {
    useAuthStore.setState({
      user: { _id: '1', name: 'John', role: 'buyer', email: 'j@j.com', createdAt: '', updatedAt: '' } as any,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeDefined();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return login, register, logout, clearError functions', () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.register).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });
});

describe('useRequireAuth', () => {
  it('should redirect unauthenticated users to login', () => {
    renderHook(() => useRequireAuth());
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/login'));
  });

  it('should not redirect when authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: '1', role: 'buyer' } as any });
    renderHook(() => useRequireAuth());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should not redirect while loading', () => {
    useAuthStore.setState({ isLoading: true });
    renderHook(() => useRequireAuth());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should use custom redirectTo', () => {
    renderHook(() => useRequireAuth('/custom-login'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/custom-login'));
  });
});

describe('useRequireRole', () => {
  it('should redirect when user role not allowed', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', role: 'buyer' } as any,
    });
    renderHook(() => useRequireRole(['admin']));
    expect(mockPush).toHaveBeenCalled();
  });

  it('should not redirect when user role is allowed', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', role: 'admin' } as any,
    });
    renderHook(() => useRequireRole(['admin']));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should not redirect while loading', () => {
    useAuthStore.setState({ isLoading: true });
    renderHook(() => useRequireRole(['admin']));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should not redirect when not authenticated', () => {
    renderHook(() => useRequireRole(['admin']));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should return hasPermission true when role matches', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', role: 'seller' } as any,
    });
    const { result } = renderHook(() => useRequireRole(['seller', 'admin']));
    expect(result.current.hasPermission).toBe(true);
  });

  it('should return hasPermission false when role does not match', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', role: 'buyer' } as any,
    });
    const { result } = renderHook(() => useRequireRole(['seller', 'admin']));
    expect(result.current.hasPermission).toBe(false);
  });

  it('should return hasPermission false when no user', () => {
    const { result } = renderHook(() => useRequireRole(['admin']));
    expect(result.current.hasPermission).toBe(false);
  });
});
