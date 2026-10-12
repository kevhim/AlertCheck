import React from 'react';

export type BadgeVariant = 'critical' | 'warning' | 'info' | 'success' | 'neutral' | 'danger';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    critical: 'bg-red-500/15 text-red-400 border border-red-500/30',
    danger: 'bg-red-500/20 text-red-300 border border-red-500/40',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    info: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    neutral: 'bg-slate-700/50 text-slate-300 border border-slate-600/50',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
