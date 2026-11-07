import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  portal?: 'pilgrim' | 'command';
  variant?: 'pilgrim' | 'command';
  elevated?: boolean;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  portal,
  variant,
  elevated = false,
  interactive = false,
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const resolvedPortal = portal || variant || 'pilgrim';
  const paddingClass = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  }[padding];

  const portalStyle =
    resolvedPortal === 'command'
      ? elevated
        ? 'bg-[#1E293B] border border-slate-700/80 text-slate-100 shadow-command-panel'
        : 'bg-[#0F172A] border border-slate-800 text-slate-100'
      : elevated
      ? 'bg-white border border-[#E5DFD5] text-[#0F172A] shadow-pilgrim-hover'
      : 'bg-white border border-[#E5DFD5] text-[#0F172A] shadow-pilgrim-card';

  const interactiveStyle = interactive
    ? resolvedPortal === 'command'
      ? 'transition-all duration-150 hover:border-cyan-500/60 hover:bg-slate-800/80 cursor-pointer'
      : 'transition-all duration-150 hover:shadow-pilgrim-hover hover:border-[#1E3A8A]/30 cursor-pointer'
    : '';

  return (
    <div
      className={`rounded-2xl ${portalStyle} ${paddingClass} ${interactiveStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

