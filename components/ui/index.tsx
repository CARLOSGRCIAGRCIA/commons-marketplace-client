import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { ComponentProps } from 'react';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

/* ─── Button ─────────────────────────────────────────────────────────── */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-display font-semibold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border-2';

  const variants = {
    primary:
      'bg-primary text-white border-primary hover:bg-primary-hover hover:border-primary-hover focus:ring-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] hover:-translate-y-0.5',
    secondary:
      'bg-secondary text-white border-secondary hover:bg-secondary-light hover:border-secondary-light focus:ring-secondary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] hover:-translate-y-0.5',
    outline:
      'bg-transparent border-gray-300 text-foreground hover:bg-gray-100 hover:border-gray-400 focus:ring-gray-300',
    ghost:
      'bg-transparent border-transparent text-foreground hover:bg-gray-100 focus:ring-gray-300',
    danger:
      'bg-danger text-white border-danger hover:opacity-90 focus:ring-danger shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] hover:-translate-y-0.5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner className="mr-2 h-4 w-4" />
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  );
}

/* ─── Input ──────────────────────────────────────────────────────────── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, maxLength, value, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-display font-semibold uppercase tracking-wider text-gray-600"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'block w-full border-2 bg-surface px-3 py-2.5 font-body text-sm transition-all duration-200',
          'placeholder:text-gray-400',
          'focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-ghost)] focus:outline-none',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          error
            ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_var(--danger-bg)]'
            : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
      {!error && typeof maxLength === 'number' && (
        <p className="text-right text-[11px] text-gray-400">
          {String(value ?? '').length}/{maxLength}
        </p>
      )}
    </div>
  );
}

/* ─── Textarea ──────────────────────────────────────────────────────── */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ className, label, error, id, maxLength, value, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-display font-semibold uppercase tracking-wider text-gray-600"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'block w-full border-2 bg-surface px-3 py-2.5 font-body text-sm transition-all duration-200 resize-none',
          'placeholder:text-gray-400',
          'focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-ghost)] focus:outline-none',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          error
            ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_var(--danger-bg)]'
            : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
      {!error && typeof maxLength === 'number' && (
        <p className="text-right text-[11px] text-gray-400">
          {String(value ?? '').length}/{maxLength}
        </p>
      )}
    </div>
  );
}

/* ─── Card ──────────────────────────────────────────────────────────── */
export function Card({ className, hoverable, children, ...props }: ComponentProps<'div'> & { hoverable?: boolean }) {
  return (
    <div
      className={cn(
        'industrial-card rounded-none overflow-hidden',
        hoverable && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('px-5 py-4 border-b-2 border-gray-200 bg-gray-50', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('px-5 py-4 border-t-2 border-gray-200 bg-gray-50', className)} {...props}>
      {children}
    </div>
  );
}

/* ─── Badge ─────────────────────────────────────────────────────────── */
export function Badge({
  className,
  children,
  variant = 'default',
  ...props
}: ComponentProps<'span'> & { variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border border-gray-300',
    success: 'bg-success-bg text-success border border-success/30',
    warning: 'bg-warning-bg text-warning border border-warning/30',
    danger: 'bg-danger-bg text-danger border border-danger/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider border-2 rounded-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* ─── Spinner ──────────────────────────────────────────────────────── */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-5 w-5 animate-spin text-primary', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C1.568 0 0 1.568 0 3h4zm2 5.196A8 8 0 014 12H0c0 1.432 1.568 3 3 3v-4zm16-2.196V3c0-1.432-1.568-3-3-3v4zm-2 5.196a8 8 0 01-4-5.196h4a8 8 0 010 5.196z"
      />
    </svg>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────────────── */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-none bg-gray-200 overflow-hidden relative',
        className
      )}
      style={{
        backgroundImage: 'linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}
