import React from "react";
import { useAdminAuth } from "@/admin/auth/useAdminAuth";
import { StaffDashboardShell } from "@/staff/layouts/StaffDashboardShell";

export const AdminDashboardLayout: React.FC = () => {
  const { staff, role, logout, hasPermission } = useAdminAuth();
  return (
    <StaffDashboardShell
      basePath="/admin"
      loginPath="/admin/login"
      staff={staff}
      role={role}
      logout={logout}
      hasPermission={hasPermission}
    />
  );
};
