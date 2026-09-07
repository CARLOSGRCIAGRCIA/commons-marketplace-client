import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/components/ui';

describe('Textarea', () => {
  it('should render textarea element', () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should render with label', () => {
    render(<Textarea label="Description" />);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('should show error message', () => {
    render(<Textarea label="Description" error="Too long" />);
    expect(screen.getByText('Too long')).toBeInTheDocument();
  });

  it('should update value on change', async () => {
    const user = userEvent.setup();
    render(<Textarea label="Description" />);
    const textarea = screen.getByLabelText('Description');
    await user.type(textarea, 'Hello world');
    expect(textarea).toHaveValue('Hello world');
  });

  it('should forward rows prop', () => {
    render(<Textarea label="Description" rows={5} />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveAttribute('rows', '5');
  });
});
