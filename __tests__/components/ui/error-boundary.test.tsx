import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

function ThrowingComponent() {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    consoleSpy.mockClear();
  });

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <p>Child content</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should render default fallback UI on error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('should reset error state on retry button click', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    const retryBtn = screen.getByText('Intentar de nuevo');
    retryBtn.click();
    rerender(
      <ErrorBoundary>
        <p>Recovered</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });

  it('should log error in componentDidCatch', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(consoleSpy).toHaveBeenCalled();
  });
});
