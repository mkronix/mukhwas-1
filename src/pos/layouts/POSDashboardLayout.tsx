import React from "react";
import { usePOSAuth } from "@/pos/auth/usePOSAuth";
import { StaffDashboardShell } from "@/staff/layouts/StaffDashboardShell";

export const POSDashboardLayout: React.FC = () => {
  const { staff, role, logout, hasPermission } = usePOSAuth();
  return (
    <StaffDashboardShell
      basePath="/pos"
      loginPath="/pos/login"
      staff={staff}
      role={role}
      logout={logout}
      hasPermission={hasPermission}
    />
  );
};
