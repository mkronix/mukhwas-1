import env from '@/config/env';
import type { Staff, Role, RolePermission } from '@/types';
import { mockStaff, mockRoles, mockRolePermissions } from '@/admin/mock';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));
const filterDev = <T extends { id?: string; email?: string; role_id?: string; is_developer?: boolean }>(
  items: T[],
): T[] =>
  items.filter(
    (i) =>
      i.email !== env.DEVELOPER_EMAIL &&
      i.role_id !== env.DEVELOPER_ROLE_ID &&
      i.is_developer !== true,
  );

export class StaffService {
  static async getAll(): Promise<Staff[]> {
    if (env.IS_MOCK_MODE) { await delay(); return filterDev(mockStaff); }
    const res = await apiClient.get<Staff[]>('/staff');
    return res.data;
  }

  static async getById(id: string): Promise<Staff | null> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const s = mockStaff.find((x) => x.id === id);
      if (!s || s.email === env.DEVELOPER_EMAIL || s.is_developer) return null;
      return s;
    }
    const res = await apiClient.get<Staff>(`/staff/${id}`);
    return res.data;
  }

  static async create(data: Omit<Staff, 'id' | 'created_at' | 'updated_at' | 'pin_failed_attempts' | 'is_locked' | 'is_developer'>): Promise<Staff> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const staff: Staff = {
        ...data,
        id: `staff_${Date.now()}`,
        pin_failed_attempts: 0,
        is_locked: false,
        is_developer: false,
        admin_access: data.admin_access ?? true,
        pos_access: data.pos_access ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockStaff.push(staff);
      return staff;
    }
    const res = await apiClient.post<Staff>('/staff', data);
    return res.data;
  }

  static async update(id: string, data: Partial<Staff>): Promise<Staff> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const idx = mockStaff.findIndex(s => s.id === id);
      if (idx === -1) throw new Error('Staff not found');
      mockStaff[idx] = { ...mockStaff[idx], ...data, updated_at: new Date().toISOString() };
      return mockStaff[idx];
    }
    const res = await apiClient.put<Staff>(`/staff/${id}`, data);
    return res.data;
  }

  static async delete(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockStaff.findIndex(s => s.id === id); if (idx !== -1) mockStaff.splice(idx, 1); return; }
    await apiClient.delete(`/staff/${id}`);
  }
}

export class RoleService {
  static async getAll(): Promise<Role[]> {
    if (env.IS_MOCK_MODE) { await delay(); return mockRoles.filter(r => r.id !== env.DEVELOPER_ROLE_ID); }
    const res = await apiClient.get<Role[]>('/roles');
    return res.data;
  }

  static async getById(id: string): Promise<Role | null> {
    if (env.IS_MOCK_MODE) { await delay(); const r = mockRoles.find(r => r.id === id); if (!r || r.id === env.DEVELOPER_ROLE_ID) return null; return r; }
    const res = await apiClient.get<Role>(`/roles/${id}`);
    return res.data;
  }

  static async create(data: Omit<Role, 'id' | 'created_at'>): Promise<Role> {
    if (env.IS_MOCK_MODE) { await delay(); const role: Role = { ...data, id: `role_${Date.now()}`, created_at: new Date().toISOString() }; mockRoles.push(role); return role; }
    const res = await apiClient.post<Role>('/roles', data);
    return res.data;
  }

  static async update(id: string, data: Partial<Role>): Promise<Role> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockRoles.findIndex(r => r.id === id); if (idx === -1) throw new Error('Role not found'); mockRoles[idx] = { ...mockRoles[idx], ...data }; return mockRoles[idx]; }
    const res = await apiClient.put<Role>(`/roles/${id}`, data);
    return res.data;
  }

  static async delete(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockRoles.findIndex(r => r.id === id); if (idx !== -1) mockRoles.splice(idx, 1); return; }
    await apiClient.delete(`/roles/${id}`);
  }

  static async getPermissions(roleId: string): Promise<RolePermission[]> {
    if (env.IS_MOCK_MODE) { await delay(); return mockRolePermissions.filter(p => p.role_id === roleId); }
    const res = await apiClient.get<RolePermission[]>(`/roles/${roleId}/permissions`);
    return res.data;
  }

  static async updatePermissions(roleId: string, perms: RolePermission[]): Promise<RolePermission[]> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const filtered = mockRolePermissions.filter(p => p.role_id !== roleId);
      filtered.push(...perms);
      mockRolePermissions.length = 0;
      mockRolePermissions.push(...filtered);
      return perms;
    }
    const res = await apiClient.put<RolePermission[]>(`/roles/${roleId}/permissions`, perms);
    return res.data;
  }

  static getStaffCountByRole(roleId: string): number {
    return filterDev(mockStaff).filter(s => s.role_id === roleId).length;
  }
}
