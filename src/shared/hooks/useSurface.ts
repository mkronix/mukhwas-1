import { useLocation } from "react-router-dom";

import {
  PermissionSurface,
  type PermissionSurfaceKey,
  type Permission,
} from "@/constant/permissions";
import { useAuthStore } from "@/store/auth.store";

export type StaffBasePath = "/admin" | "/pos";

export type { PermissionSurfaceKey };

function pathnameIsPos(pathname: string): boolean {
  return pathname === "/pos" || pathname.startsWith("/pos/");
}

export function useSurface(): PermissionSurfaceKey {
  const { pathname } = useLocation();
  return pathnameIsPos(pathname) ? PermissionSurface.POS : PermissionSurface.ADMIN;
}

/** Base URL prefix for staff dashboard links; derived from the current pathname. */
export function useStaffBasePath(): StaffBasePath {
  return useSurface() === PermissionSurface.POS ? "/pos" : "/admin";
}

/**
 * Permissions for the active staff surface. Both auth providers sync this into the
 * auth store on login, so it matches admin vs POS without conditional context hooks.
 */
export function useSurfacePermissions(): Permission[] {
  return useAuthStore((s) => s.permissions);
}
