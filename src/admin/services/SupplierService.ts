import { mockSuppliers } from '@/admin/mock/suppliers';
import type { SupplierRecord } from '@/types';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class SupplierService {
  static async getAll(): Promise<SupplierRecord[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockSuppliers]; }
    const res = await apiClient.get<SupplierRecord[]>('/suppliers');
    return res.data;
  }

  static async getById(id: string): Promise<SupplierRecord | null> {
    if (env.IS_MOCK_MODE) { await delay(); return mockSuppliers.find(s => s.id === id) ?? null; }
    const res = await apiClient.get<SupplierRecord>(`/suppliers/${id}`);
    return res.data;
  }

  static async create(data: Omit<SupplierRecord, 'id' | 'created_at' | 'outstanding_paisa' | 'last_purchase_date' | 'linked_materials_count'>): Promise<SupplierRecord> {
    if (env.IS_MOCK_MODE) { await delay(); const supplier: SupplierRecord = { ...data, id: `sup_${Date.now()}`, created_at: new Date().toISOString(), outstanding_paisa: 0, last_purchase_date: '', linked_materials_count: 0 }; mockSuppliers.push(supplier); return supplier; }
    const res = await apiClient.post<SupplierRecord>('/suppliers', data);
    return res.data;
  }

  static async update(id: string, data: Partial<SupplierRecord>): Promise<SupplierRecord> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockSuppliers.findIndex(s => s.id === id); if (idx === -1) throw new Error('Supplier not found'); mockSuppliers[idx] = { ...mockSuppliers[idx], ...data }; return mockSuppliers[idx]; }
    const res = await apiClient.put<SupplierRecord>(`/suppliers/${id}`, data);
    return res.data;
  }
}
