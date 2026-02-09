import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base
          "flex h-12 w-full bg-[var(--color-surface)] px-4 py-2 text-sm ring-offset-black file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // Text
          "text-[var(--color-chalk)] placeholder:text-gray-600",
          // Borders & Shape (Acid Editorial: Sharp, Bottom Border emphasis or flat block)
          "rounded-none border-b-2 border-[var(--color-subtle)] focus-visible:border-[var(--color-acid)]",
          // Clean up standard borders
          "border-t-0 border-x-0", 
          // Interaction
          "focus-visible:outline-none transition-colors duration-300",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
