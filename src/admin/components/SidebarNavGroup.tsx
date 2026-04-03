import React from 'react';
import { NavLink } from 'react-router-dom';
import type { NavItem } from '../constant/nav';

interface SidebarNavGroupProps {
    group: string;
    items: NavItem[];
    collapsed: boolean;
    onNavigate: () => void;
}

export const SidebarNavGroup: React.FC<SidebarNavGroupProps> = ({
    group,
    items,
    collapsed,
    onNavigate,
}) => (
    <div>
        {!collapsed && (
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group}
            </p>
        )}
        <div className="space-y-0.5">
            {items.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150
            ${collapsed ? 'justify-center' : ''}
            ${isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`
                    }
                >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                </NavLink>
            ))}
        </div>
    </div>
);