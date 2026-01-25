import React from 'react';
import { cn } from '@/lib/utils'; // I need to create utils if not exists, but I probably used it in create-next-app? No I need to create it.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95";
    
    const variants = {
      primary: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30",
      secondary: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
      outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
      ghost: "hover:bg-slate-100 text-slate-700",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        className={(
            `${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
