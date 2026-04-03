import React from "react";
import type { Permission } from "@/constant/permissions";
import { useAuthStore } from "@/store/auth.store";

interface PermissionGuardProps {
  permission?: Permission | Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface MultiPermissionGuardProps {
  permissions: Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  requireAll = false,
  children,
  fallback,
}) => {
  const hasPermissionFn = useAuthStore((s) => s.hasPermission);

  if (!permission) return <>{children}</>;

  const allowed = Array.isArray(permission)
    ? requireAll
      ? permission.every((p) => hasPermissionFn(p.module, p.action))
      : permission.some((p) => hasPermissionFn(p.module, p.action))
    : hasPermissionFn(permission.module, permission.action);

  return <>{allowed ? children : (fallback ?? null)}</>;
};

export const MultiPermissionGuard: React.FC<MultiPermissionGuardProps> = ({
  permissions,
  requireAll = false,
  children,
  fallback,
}) => {
  const hasPermissionFn = useAuthStore((s) => s.hasPermission);

  const allowed = requireAll
    ? permissions.every((p) => hasPermissionFn(p.module, p.action))
    : permissions.some((p) => hasPermissionFn(p.module, p.action));

  return <>{allowed ? children : (fallback ?? null)}</>;
};