import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | string;
  padding?: string;
  className?: string;
}

export default function Container({
  children,
  maxWidth = 'lg',
  padding,
  className,
}: ContainerProps) {
  // Map the maxWidth to Tailwind CSS classes
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'xs': return 'max-w-xs'; // 320px
      case 'sm': return 'max-w-sm'; // 640px
      case 'md': return 'max-w-md'; // 768px
      case 'lg': return 'max-w-6xl'; // 1024px
      case 'xl': return 'max-w-7xl'; // 1280px
      case 'full': return 'max-w-full';
      default: return `max-w-[${maxWidth}]`; // Custom width
    }
  };

  // Default padding class if not provided
  const paddingClass = padding || 'px-4';

  return (
    <div
      className={cn(
        'w-full mx-auto ',
        getMaxWidthClass(),
        paddingClass,
        className
      )}
    >
      {children}
    </div>
  );
}