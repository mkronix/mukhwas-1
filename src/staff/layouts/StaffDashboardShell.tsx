import React, { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Sidebar } from "@/admin/components/Sidebar";
import { Topbar } from "@/admin/components/Topbar";
import { SearchBar } from "@/admin/components/SearchBar";
import { buildStaffNavItems } from "@/admin/constant/nav";
import { useStaffPageTitle } from "@/admin/hooks/usePageTitle";
import { StaffUiPaletteProvider, staffBasePathToSurface } from "@/staff/context/StaffUiPaletteContext";
import { filterStaffNavItems } from "@/staff/lib/filterStaffNavItems";
import { useAuthStore } from "@/store/auth.store";
import type { StaffBasePath } from "@/staff/StaffSurfaceContext";
import { StaffSurfaceProvider } from "@/staff/StaffSurfaceContext";
import type { Role, Staff } from "@/types";
import type { ActionKey, ModuleKey } from "@/constant/permissions";

export interface StaffDashboardShellProps {
  basePath: StaffBasePath;
  loginPath: string;
  staff: Staff | null;
  role: Role | null;
  logout: () => void;
  hasPermission: (module: ModuleKey, action: ActionKey) => boolean;
}

export const StaffDashboardShell: React.FC<StaffDashboardShellProps> = ({
  basePath,
  loginPath,
  staff,
  role,
  logout,
  hasPermission,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTerminalRoute =
    location.pathname === `${basePath}/terminal` ||
    location.pathname === `${basePath}/terminal/`;

  const navItems = useMemo(() => buildStaffNavItems(basePath), [basePath]);
  const pageTitle = useStaffPageTitle(basePath);
  const isDeveloper = useAuthStore((s) => s.isDeveloper);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredNav = useMemo(
    () => filterStaffNavItems(navItems, hasPermission, isDeveloper),
    [navItems, hasPermission, isDeveloper],
  );
  const navGroups = [...new Set(filteredNav.map((i) => i.group))];

  const initials =
    staff?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "—";

  const handleLogout = () => {
    logout();
    navigate(loginPath);
  };

  const surface = staffBasePathToSurface(basePath);

  if (isTerminalRoute) {
    return (
      <StaffSurfaceProvider basePath={basePath}>
        <StaffUiPaletteProvider surface={surface}>
          <div className="h-screen flex flex-col bg-background overflow-hidden">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </StaffUiPaletteProvider>
      </StaffSurfaceProvider>
    );
  }

  return (
    <StaffSurfaceProvider basePath={basePath}>
      <StaffUiPaletteProvider surface={surface}>
      <div className="h-screen flex overflow-hidden bg-background">
        <Sidebar
          open={sidebarOpen}
          collapsed={collapsed}
          navGroups={navGroups}
          filteredNav={filteredNav}
          staffName={staff?.name}
          roleName={role?.name}
          initials={initials}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          onLogout={handleLogout}
        />

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar
            pageTitle={pageTitle}
            initials={initials}
            staffName={staff?.name}
            staffEmail={staff?.email}
            notifOpen={notifOpen}
            searchOpen={searchOpen}
            onMenuOpen={() => setSidebarOpen(true)}
            onNotifOpenChange={setNotifOpen}
            onSearchToggle={() => setSearchOpen((prev) => !prev)}
            onLogout={handleLogout}
          />

          <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
      </StaffUiPaletteProvider>
    </StaffSurfaceProvider>
  );
};
