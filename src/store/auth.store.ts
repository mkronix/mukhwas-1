import { create } from 'zustand';
import { type ActionKey, type ModuleKey, type Permission } from '@/constant/permissions';

interface AuthState {
  permissions: Permission[];
  /** When true, all permission checks succeed (system developer session). */
  isDeveloper: boolean;
  hasPermission: (module: ModuleKey, action: ActionKey) => boolean;
  hasPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  setPermissions: (permissions: Permission[], isDeveloper?: boolean) => void;
}

const matchPermission = (stored: Permission[], module: ModuleKey, action: ActionKey): boolean =>
  stored.some(p => p.module === module && p.action === action);

export const useAuthStore = create<AuthState>((set, get) => ({
  permissions: [],
  isDeveloper: false,
  hasPermission: (module, action) =>
    get().isDeveloper || matchPermission(get().permissions, module, action),
  hasPermissions: (permissions) =>
    get().isDeveloper ||
    permissions.every((p) => matchPermission(get().permissions, p.module, p.action)),
  hasAnyPermission: (permissions) =>
    get().isDeveloper ||
    permissions.some((p) => matchPermission(get().permissions, p.module, p.action)),
  setPermissions: (permissions, isDeveloper = false) =>
    set({
      permissions,
      isDeveloper: permissions.length === 0 ? false : isDeveloper,
    }),
}));