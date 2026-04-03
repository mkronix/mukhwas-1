import React from "react";
import { LogOut, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarNavGroup } from "./SidebarNavGroup";
import type { NavItem } from "../constant/nav";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  navGroups: string[];
  filteredNav: NavItem[];
  staffName: string | undefined;
  roleName: string | undefined;
  initials: string;
  onClose: () => void;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  collapsed,
  navGroups,
  filteredNav,
  staffName,
  roleName,
  initials,
  onClose,
  onToggleCollapse,
  onLogout,
}) => (
  <aside
    className={`fixed inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out
      lg:relative lg:translate-x-0
      ${collapsed ? "lg:w-[68px]" : "lg:w-[260px]"}
      ${open ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full lg:translate-x-0"}
    `}
  >
    <div
      className={`flex items-center h-14 px-4 border-b border-border shrink-0 ${
        collapsed ? "justify-center" : "justify-between"
      }`}
    >
      {collapsed ? (
        <span className="text-base font-black text-primary">M</span>
      ) : (
        <span className="text-base font-bold text-foreground tracking-tight">
          Mukhwas OS
        </span>
      )}
      <Button
        onClick={onClose}
        variant="ghost"
        className="lg:hidden text-muted-foreground hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>

    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-hide">
      {navGroups.map((group) => {
        const items = filteredNav.filter((i) => i.group === group);
        if (!items.length) return null;
        return (
          <SidebarNavGroup
            key={group}
            group={group}
            items={items}
            collapsed={collapsed}
            onNavigate={onClose}
          />
        );
      })}
    </nav>

    <div className="border-t border-border p-3 shrink-0">
      {!collapsed && (
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
      )}
      <Button
        onClick={onLogout}
        title={collapsed ? "Logout" : undefined}
        className={`flex items-center gap-3 w-full
          ${collapsed ? "justify-center" : ""}
        `}
      >
        <LogOut className="h-4 w-4" />
        {!collapsed && <span>Logout</span>}
      </Button>
    </div>

    <button
      onClick={onToggleCollapse}
      className="hidden lg:flex absolute -right-3 top-3 p-2 rounded-full border border-border bg-primary items-center justify-center text-primary-foreground z-10"
    >
      {collapsed ? (
        <ChevronRight className="h-3 w-3" />
      ) : (
        <ChevronLeft className="h-3 w-3" />
      )}
    </button>
  </aside>
);
