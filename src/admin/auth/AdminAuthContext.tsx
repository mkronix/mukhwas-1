import React, { createContext, useState, useCallback } from 'react';
import type { Staff, Role, RolePermission } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { mockStaff, mockRoles, mockRolePermissions } from '@/admin/mock';
import { Action, type ActionKey, type ModuleKey, type Permission } from "@/constant/permissions";
import env from '@/config/env';
import { adminApiClient } from '@/lib/apiClient';

interface AdminAuthState {
  staff: Staff | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AdminAuthContextValue extends AdminAuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (module: ModuleKey, action: ActionKey) => boolean;
  hasPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

const initialState: AdminAuthState = {
  staff: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
};

export const AdminAuthContext = createContext<AdminAuthContextValue>({
  ...initialState,
  login: async () => { },
  logout: () => { },
  hasPermission: () => false,
  hasPermissions: () => false,
  hasAnyPermission: () => false,
});

function buildPermissions(perms: RolePermission[], surface: "admin" | "pos"): Permission[] {
  const result: Permission[] = [];
  for (const p of perms) {
    if (p.surface !== surface) continue;
    if (p.can_read) result.push({ module: p.module as ModuleKey, action: Action.READ });
    if (p.can_create) result.push({ module: p.module as ModuleKey, action: Action.CREATE });
    if (p.can_update) result.push({ module: p.module as ModuleKey, action: Action.UPDATE });
    if (p.can_delete) result.push({ module: p.module as ModuleKey, action: Action.DELETE });
    if (p.can_export) result.push({ module: p.module as ModuleKey, action: Action.EXPORT });
    if (p.can_view_reports) result.push({ module: p.module as ModuleKey, action: Action.VIEW_REPORTS });
    let ext = p.extended_actions;
    if (typeof ext === "string") {
      try {
        ext = JSON.parse(ext) as string[];
      } catch {
        ext = [];
      }
    }
    if (Array.isArray(ext)) {
      for (const action of ext) {
        if (typeof action === "string") {
          result.push({ module: p.module as ModuleKey, action: action as ActionKey });
        }
      }
    }
  }
  return result;
}

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setPermissions, hasPermission, hasPermissions, hasAnyPermission } = useAuthStore();

  const [state, setState] = useState<AdminAuthState>(() => {
    const stored = localStorage.getItem('adm_auth');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setPermissions(data.permissions || [], Boolean(data.staff?.is_developer));
        return { staff: data.staff, role: data.role, isAuthenticated: true, isLoading: false };
      } catch {
        localStorage.removeItem('adm_auth');
      }
    }
    return { ...initialState, isLoading: false };
  });

  const login = useCallback(async (email: string, password: string) => {
    if (env.IS_MOCK_MODE) {
      // Mock mode: validate against mock data
      await new Promise(r => setTimeout(r, 300));
      const staff = mockStaff.find(s => s.email === email);
      if (!staff) throw new Error('Invalid credentials');
      const role = mockRoles.find(r => r.id === staff.role_id);
      if (!role) throw new Error('Role not found');
      const rolePerms = mockRolePermissions.filter((p) => p.role_id === role.id);
      const permissions = buildPermissions(rolePerms, "admin");
      localStorage.setItem('adm_auth', JSON.stringify({ staff, role, permissions }));
      setPermissions(permissions, Boolean(staff.is_developer));
      setState({ staff, role, isAuthenticated: true, isLoading: false });
    } else {
      // API mode: call backend
      const res = await adminApiClient.post<{
        staff: Staff;
        role: Role;
        permissions: Permission[];
        token: string;
      }>('/auth/admin/login', { email, password });
      const { staff, role, permissions, token } = res.data;
      localStorage.setItem('adm_auth', JSON.stringify({ staff, role, permissions, token }));
      setPermissions(permissions, Boolean(staff.is_developer));
      setState({ staff, role, isAuthenticated: true, isLoading: false });
    }
  }, [setPermissions]);

  const logout = useCallback(() => {
    localStorage.removeItem('adm_auth');
    setPermissions([]);
    setState({ ...initialState, isLoading: false });
  }, [setPermissions]);

  return (
    <AdminAuthContext.Provider value={{ ...state, login, logout, hasPermission, hasPermissions, hasAnyPermission }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
