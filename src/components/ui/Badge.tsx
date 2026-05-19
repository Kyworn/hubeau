import { HTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'destructive' | 'outline' | 'secondary';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'outline', ...props }, ref) => {
    const variants = {
      success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      destructive: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      secondary: 'bg-secondary text-secondary-foreground border-transparent',
      outline: 'text-foreground border-border',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
