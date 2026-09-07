import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRequireAuth, useRequireRole } from '@/hooks/use-auth';
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
