export type RolePermissionSurface = "admin" | "pos";

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role_id: string;
  admin_access: boolean;
  pos_access: boolean;
  pin_hash?: string;
  pin_failed_attempts: number;
  pin_locked_at: string | null;
  is_locked: boolean;
  is_developer: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  surface: RolePermissionSurface;
  is_system_role: boolean;
  created_by: string;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  module: string;
  surface: RolePermissionSurface;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_view_reports: boolean;
  extended_actions?: string[];
}