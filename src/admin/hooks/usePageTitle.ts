import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { buildStaffNavItems } from "../constant/nav";
import type { StaffBasePath } from "@/staff/StaffSurfaceContext";

export const useStaffPageTitle = (basePath: StaffBasePath): string => {
  const location = useLocation();
  const navItems = useMemo(() => buildStaffNavItems(basePath), [basePath]);

  const current = navItems.find((item) =>
    item.end
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to) && item.to !== basePath,
  );

  return current?.label ?? "Dashboard";
};

/** @deprecated prefer useStaffPageTitle(basePath) */
export const usePageTitle = (): string => useStaffPageTitle("/admin");