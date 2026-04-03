import React, { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarNavGroup } from "@/admin/components/SidebarNavGroup";
import { buildStaffNavItems } from "@/admin/constant/nav";
import { filterStaffNavItems } from "@/staff/lib/filterStaffNavItems";
import { useAuthStore } from "@/store/auth.store";
import { usePOSAuth } from "@/pos/auth/usePOSAuth";

interface POSTerminalNavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const POSTerminalNavSheet: React.FC<POSTerminalNavSheetProps> = ({
  open,
  onOpenChange,
}) => {
  const { hasPermission } = usePOSAuth();
  const isDeveloper = useAuthStore((s) => s.isDeveloper);
  const navItems = useMemo(() => buildStaffNavItems("/pos"), []);
  const filteredNav = useMemo(
    () => filterStaffNavItems(navItems, hasPermission, isDeveloper),
    [navItems, hasPermission, isDeveloper],
  );
  const navGroups = [...new Set(filteredNav.map((i) => i.group))];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[min(100%,280px)] p-0 flex flex-col gap-0">
        <SheetHeader className="p-4 border-b border-border text-left space-y-0">
          <SheetTitle className="text-base">POS navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-hide">
          {navGroups.map((group) => {
            const items = filteredNav.filter((i) => i.group === group);
            if (!items.length) return null;
            return (
              <SidebarNavGroup
                key={group}
                group={group}
                items={items}
                collapsed={false}
                onNavigate={() => onOpenChange(false)}
              />
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
