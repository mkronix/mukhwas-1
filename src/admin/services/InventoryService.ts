import { mockFinishedGoods, mockRawMaterials, mockStockMovements } from '@/admin/mock/inventory';
import type { FinishedGoodRecord, RawMaterialRecord, StockMovementRecord } from '@/types';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class InventoryService {
  static async getFinishedGoods(): Promise<FinishedGoodRecord[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockFinishedGoods]; }
    const res = await apiClient.get<FinishedGoodRecord[]>('/inventory/finished-goods');
    return res.data;
  }

  static async adjustFinishedGoodStock(variantId: string, type: 'add' | 'remove', quantity: number, reason: string, reference?: string): Promise<void> {
    if (!env.IS_MOCK_MODE) { await apiClient.post(`/inventory/finished-goods/${variantId}/adjust`, { type, quantity, reason, reference }); return; }
    await delay();
    const fg = mockFinishedGoods.find(f => f.variant_id === variantId);
    if (!fg) throw new Error('Variant not found');
    const before = fg.current_stock;
    fg.current_stock = type === 'add' ? fg.current_stock + quantity : Math.max(0, fg.current_stock - quantity);
    fg.status = fg.current_stock <= 0 ? 'out_of_stock' : fg.current_stock <= fg.reorder_level ? 'low_stock' : 'in_stock';
    fg.last_movement_date = new Date().toISOString();
    mockStockMovements.unshift({
      id: `mv_${Date.now()}`, timestamp: new Date().toISOString(), movement_type: 'manual_adjustment',
      item_name: fg.product_name, item_type: 'finished_good',
      quantity_change: type === 'add' ? quantity : -quantity, stock_before: before, stock_after: fg.current_stock,
      unit: fg.unit, reference: reference || '', reference_label: `ADJ: ${reason}`, performed_by: 'Admin User',
    });
  }

  static async getRawMaterials(): Promise<RawMaterialRecord[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockRawMaterials]; }
    const res = await apiClient.get<RawMaterialRecord[]>('/inventory/raw-materials');
    return res.data;
  }

  static async createRawMaterial(data: Omit<RawMaterialRecord, 'id' | 'status' | 'last_purchase_date'>): Promise<RawMaterialRecord> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const rm: RawMaterialRecord = { ...data, id: `rm_${Date.now()}`, status: data.current_stock <= 0 ? 'out_of_stock' : data.current_stock <= data.reorder_level ? 'low_stock' : 'in_stock', last_purchase_date: new Date().toISOString() };
      mockRawMaterials.push(rm);
      return rm;
    }
    const res = await apiClient.post<RawMaterialRecord>('/inventory/raw-materials', data);
    return res.data;
  }

  static async updateRawMaterial(id: string, data: Partial<RawMaterialRecord>): Promise<RawMaterialRecord> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockRawMaterials.findIndex(r => r.id === id); if (idx === -1) throw new Error('Raw material not found'); mockRawMaterials[idx] = { ...mockRawMaterials[idx], ...data }; return mockRawMaterials[idx]; }
    const res = await apiClient.put<RawMaterialRecord>(`/inventory/raw-materials/${id}`, data);
    return res.data;
  }

  static async adjustRawMaterialStock(id: string, type: 'add' | 'remove', quantity: number, reason: string): Promise<void> {
    if (!env.IS_MOCK_MODE) { await apiClient.post(`/inventory/raw-materials/${id}/adjust`, { type, quantity, reason }); return; }
    await delay();
    const rm = mockRawMaterials.find(r => r.id === id);
    if (!rm) throw new Error('Raw material not found');
    const before = rm.current_stock;
    rm.current_stock = type === 'add' ? rm.current_stock + quantity : Math.max(0, rm.current_stock - quantity);
    rm.status = rm.current_stock <= 0 ? 'out_of_stock' : rm.current_stock <= rm.reorder_level ? 'low_stock' : 'in_stock';
    mockStockMovements.unshift({
      id: `mv_${Date.now()}`, timestamp: new Date().toISOString(), movement_type: 'manual_adjustment',
      item_name: rm.name, item_type: 'raw_material',
      quantity_change: type === 'add' ? quantity : -quantity, stock_before: before, stock_after: rm.current_stock,
      unit: rm.unit, reference: '', reference_label: `ADJ: ${reason}`, performed_by: 'Admin User',
    });
  }

  static async getStockMovements(): Promise<StockMovementRecord[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockStockMovements].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); }
    const res = await apiClient.get<StockMovementRecord[]>('/inventory/movements');
    return res.data;
  }

  static async getFinishedGoodStats() {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<{ totalSkus: number; totalValue: number; lowStock: number; outOfStock: number }>('/inventory/finished-goods/stats'); return res.data; }
    await delay();
    const totalSkus = mockFinishedGoods.length;
    const totalValue = mockFinishedGoods.reduce((s, f) => s + f.stock_value_paisa, 0);
    const lowStock = mockFinishedGoods.filter(f => f.status === 'low_stock').length;
    const outOfStock = mockFinishedGoods.filter(f => f.status === 'out_of_stock').length;
    return { totalSkus, totalValue, lowStock, outOfStock };
  }
}
