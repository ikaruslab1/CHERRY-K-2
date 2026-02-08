"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
}

// Combine Motion props with Button props
type CombinedButtonProps = ButtonProps & HTMLMotionProps<"button">;

export const Button = React.forwardRef<HTMLButtonElement, CombinedButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    
    // Acid Editorial Base Styles
    // Sharp corners (rounded-none), uppercase text, tracking-wide for that "Editoral" feel
    const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-black";
    
    // Variants - The "Acid" Palette
    const variants = {
      primary: "bg-[var(--color-acid)] text-black hover:bg-[#c6e025] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] border border-transparent",
      secondary: "bg-[var(--color-electric)] text-white hover:bg-[#4d12c4] border border-transparent",
      outline: "bg-transparent border-2 border-[var(--color-subtle)] text-[var(--color-chalk)] hover:bg-[var(--color-chalk)] hover:text-black hover:border-[var(--color-chalk)]",
      ghost: "hover:bg-[var(--color-surface)] text-[var(--color-chalk)]",
      destructive: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-12 px-6 text-sm",
      lg: "h-14 px-8 text-base",
      icon: "h-12 w-12",
    };

    // Animation presets for that "Physical" feel
    const animations = {
      whileHover: { scale: 1.02, y: -1 },
      whileTap: { scale: 0.96, y: 1 },
    };

    return (
      <motion.button
        ref={ref} // motion handles refs slightly differently but for simple DOM forwardRef it works usually if typed right.
        className={cn(
            baseStyles,
            variants[variant],
            sizes[size],
            "rounded-none", // Enforce sharp edges
            className
        )}
        {...animations}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
