import React from "react";
import { LogOut, Monitor, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { POSSidebarNavGroup } from "./POSSidebarNavGroup";
import type { POSNavItem } from "../constants/nav";

interface POSSidebarProps {
  open: boolean;
  navGroups: string[];
  filteredNav: POSNavItem[];
  staffName: string | undefined;
  roleName: string | undefined;
  initials: string;
  onClose: () => void;
  onSwitchToTerminal: () => void;
  onLogout: () => void;
}

export const POSSidebar: React.FC<POSSidebarProps> = ({
  open,
  navGroups,
  filteredNav,
  staffName,
  roleName,
  initials,
  onClose,
  onSwitchToTerminal,
  onLogout,
}) => (
  <aside
    className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
  >
    <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
      <span className="text-base font-bold text-foreground tracking-tight">
        POS Management
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onSwitchToTerminal}
          title="Back to Terminal"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Monitor className="h-4 w-4" />
        </button>
        <button
          onClick={onClose}
          className="lg:hidden text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>

    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-hide">
      {navGroups.map((group) => {
        const items = filteredNav.filter((i) => i.group === group);
        if (!items.length) return null;
        return (
          <POSSidebarNavGroup
            key={group}
            group={group}
            items={items}
            onNavigate={onClose}
          />
        );
      })}
    </nav>

    <div className="border-t border-border p-3 shrink-0">
      <div className="flex items-center gap-3 px-2 mb-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-foreground truncate">
            {staffName}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {roleName}
          </p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-3 w-full px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </button>
    </div>
  </aside>
);
