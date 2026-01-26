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
      primary: "bg-[#373737] text-white hover:bg-[#2a2a2a] hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#373737]/20",
      secondary: "bg-gray-100 text-[#373737] hover:bg-gray-200",
      outline: "border-2 border-[#373737] text-[#373737] hover:bg-[#373737] hover:text-white",
      ghost: "hover:bg-gray-50 text-[#373737]",
    };

    const sizes = {
      sm: "h-10 px-4 text-xs rounded-lg",
      md: "h-12 px-6 text-sm rounded-xl",
      lg: "h-14 px-8 text-base rounded-xl",
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
