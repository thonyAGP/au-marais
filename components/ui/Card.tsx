import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}

export const Card = ({
  className,
  variant = 'default',
  children,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg overflow-hidden transition-all duration-300',
        {
          'border border-stone-200 hover:border-stone-300 hover:shadow-md': variant === 'default',
          'shadow-lg hover:shadow-xl hover:-translate-y-1': variant === 'elevated',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
};

export const CardContent = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
};
