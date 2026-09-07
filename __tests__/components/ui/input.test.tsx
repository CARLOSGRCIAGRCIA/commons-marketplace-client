import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should render with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should show error message', () => {
    render(<Input label="Email" error="Email is required" />);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('should not show error when no error prop', () => {
    render(<Input label="Email" />);
    expect(screen.queryByText(/required/)).not.toBeInTheDocument();
  });

  it('should show character count with maxLength', () => {
    render(<Input label="Name" maxLength={50} value="" onChange={() => {}} />);
    expect(screen.getByText('0/50')).toBeInTheDocument();
  });

  it('should update value on change', async () => {
    const user = userEvent.setup();
    render(<Input label="Name" />);
    const input = screen.getByLabelText('Name');
    await user.type(input, 'John');
    expect(input).toHaveValue('John');
  });

  it('should forward type prop', () => {
    render(<Input type="password" label="Password" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });
});
