import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  portal?: 'pilgrim' | 'command';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'saffron';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  portal = 'pilgrim',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizeClasses = {
    sm: 'min-h-[38px] px-3.5 py-1.5 text-xs rounded-lg',
    md: 'min-h-[44px] px-4 py-2.5 text-sm rounded-xl',
    lg: 'min-h-[50px] px-6 py-3 text-base rounded-xl',
  }[size];

  const pilgrimVariants = {
    primary:
      'bg-[#1E3A8A] text-white hover:bg-[#172554] active:bg-[#0F172A] shadow-sm focus-visible:ring-[#1E3A8A]',
    secondary:
      'bg-[#0D9488] text-white hover:bg-[#0F766E] active:bg-[#115E59] shadow-sm focus-visible:ring-[#0D9488]',
    saffron:
      'bg-[#D97706] text-white hover:bg-[#B45309] active:bg-[#92400E] shadow-sm focus-visible:ring-[#D97706]',
    outline:
      'border-2 border-[#1E3A8A]/20 bg-white text-[#0F172A] hover:border-[#1E3A8A] hover:bg-[#F8FAFC] focus-visible:ring-[#1E3A8A]',
    ghost:
      'bg-transparent text-[#0F172A] hover:bg-[#F3EFEA] focus-visible:ring-[#1E3A8A]',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-600',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-600',
  };

  const commandVariants = {
    primary:
      'bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:bg-cyan-300 shadow-sm focus-visible:ring-cyan-400 focus-visible:ring-offset-slate-900',
    secondary:
      'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 focus-visible:ring-cyan-400 focus-visible:ring-offset-slate-900',
    saffron:
      'bg-amber-500 text-slate-950 hover:bg-amber-400 focus-visible:ring-amber-400 focus-visible:ring-offset-slate-900',
    outline:
      'border border-cyan-500/40 bg-slate-900/80 text-cyan-300 hover:bg-cyan-950/60 hover:border-cyan-400 focus-visible:ring-cyan-400 focus-visible:ring-offset-slate-900',
    ghost:
      'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-cyan-400 focus-visible:ring-offset-slate-900',
    danger:
      'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus-visible:ring-red-500 focus-visible:ring-offset-slate-900',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 focus-visible:ring-emerald-500 focus-visible:ring-offset-slate-900',
  };

  const variantClasses =
    portal === 'command' ? commandVariants[variant] : pilgrimVariants[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

