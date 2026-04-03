import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { usePOSAuth } from "@/pos/auth/usePOSAuth";
import { useNetworkStatus } from "@/pos/hooks/useNetworkStatus";
import { useTheme } from "next-themes";
import {
  ChevronRight,
  HelpCircle,
  Moon,
  Sun,
  Wifi,
  WifiOff,
} from "lucide-react";
import { POS_NAV_ITEMS } from "../constants/nav";
import { POSSidebar } from "../components/POSSidebar";
import { POSTopbar } from "../components/POSTopbar";
import env from "@/config/env";
import { useAuthStore } from "@/store/auth.store";

type POSMode = "terminal" | "management";

export const POSLayout: React.FC = () => {
  const { staff, role, logout, hasPermission } = usePOSAuth();
  const isDeveloper = useAuthStore((s) => s.isDeveloper);
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
  const { theme, setTheme } = useTheme();
  const [mode, setMode] = useState<POSMode>("terminal");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNav = POS_NAV_ITEMS.filter(
    (item) =>
      (!item.module ||
        !item.action ||
        hasPermission(item.module, item.action)) &&
      (!item.devOnly || env.IS_DEV_MODE || isDeveloper),
  );
  const navGroups = [...new Set(filteredNav.map((i) => i.group))];

  const initials =
    staff?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "PO";

  const handleLogout = () => {
    logout();
    navigate("/pos/login");
  };
  const handleSwitchToTerminal = () => {
    setMode("terminal");
    navigate("/pos");
  };

  const sessionTime = staff
    ? new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  if (mode === "terminal") {
    return (
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {!isOnline && (
          <div className="bg-warning text-warning-foreground text-center text-xs py-1.5 px-4 flex items-center justify-center gap-2">
            <WifiOff className="h-3.5 w-3.5" />
            No network connection. POS requires an active connection to process
            transactions.
          </div>
        )}
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-3 shrink-0">
          <span className="text-sm font-bold text-foreground tracking-tight">
            POS
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{staff?.name}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{sessionTime}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{todayDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5 text-success" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-destructive" />
            )}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("pos:toggle-help"))
              }
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => setMode("management")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-accent transition-colors"
            >
              Management <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-hidden">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <POSSidebar
        open={sidebarOpen}
        navGroups={navGroups}
        filteredNav={filteredNav}
        staffName={staff?.name}
        roleName={role?.name}
        initials={initials}
        onClose={() => setSidebarOpen(false)}
        onSwitchToTerminal={handleSwitchToTerminal}
        onLogout={handleLogout}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <POSTopbar
          staffName={staff?.name}
          onMenuOpen={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
