import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui';

describe('Badge', () => {
  it('should render with text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should render default variant', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge.className).toContain('bg-gray-100');
  });

  it('should render success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge.className).toContain('bg-success-bg');
  });

  it('should render warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText('Warning');
    expect(badge.className).toContain('bg-warning-bg');
  });

  it('should render danger variant', () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText('Danger');
    expect(badge.className).toContain('bg-danger-bg');
  });
});
