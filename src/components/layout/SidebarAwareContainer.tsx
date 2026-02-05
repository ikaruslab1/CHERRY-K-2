'use client';

import { ReactNode } from 'react';
import { useSidebar } from '@/context/SidebarContext';

interface SidebarAwareContainerProps {
    children: ReactNode;
    className?: string;
}

export function SidebarAwareContainer({ children, className = '' }: SidebarAwareContainerProps) {
    const { isDesktopCollapsed } = useSidebar();
    
    const marginClass = isDesktopCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]';
    
    return (
        <div className={`${className} ${marginClass} transition-all duration-300`}>
            {children}
        </div>
    );
}
