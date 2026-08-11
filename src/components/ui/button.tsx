import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-mono font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded border';

    const variants = {
      primary: 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-400 border-emerald-800/80 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
      secondary: 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700',
      danger: 'bg-red-950/80 hover:bg-red-900/90 text-red-400 border-red-800/80',
      ghost: 'bg-transparent hover:bg-zinc-800/50 text-zinc-400 border-transparent'
    };

    const sizes = {
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
