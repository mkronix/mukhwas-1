import React from "react";
import { NavLink } from "react-router-dom";
import type { POSNavItem } from "../constants/nav";

interface POSSidebarNavGroupProps {
  group: string;
  items: POSNavItem[];
  onNavigate: () => void;
}

export const POSSidebarNavGroup: React.FC<POSSidebarNavGroupProps> = ({
  group,
  items,
  onNavigate,
}) => (
  <div>
    <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
      {group}
    </p>
    <div className="space-y-0.5">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/pos"}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150
                        ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`
          }
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  </div>
);
