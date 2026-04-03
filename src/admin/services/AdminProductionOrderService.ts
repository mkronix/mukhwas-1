import { mockProductionOrders } from '@/admin/mock/production';
import type { ProductionOrderRecord } from '@/types';
import type { ProductionStatus } from '@/types';
import { EventBus, EVENT_TYPES } from '@/admin/services/EventBus';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class AdminProductionOrderService {
  static async getAll(): Promise<ProductionOrderRecord[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockProductionOrders]; }
    const res = await apiClient.get<ProductionOrderRecord[]>('/production/orders');
    return res.data;
  }

  static async getById(id: string): Promise<ProductionOrderRecord | null> {
    if (env.IS_MOCK_MODE) { await delay(); return mockProductionOrders.find(o => o.id === id) ?? null; }
    const res = await apiClient.get<ProductionOrderRecord>(`/production/orders/${id}`);
    return res.data;
  }

  static async create(data: Omit<ProductionOrderRecord, 'id' | 'order_number' | 'actual_quantity' | 'status' | 'created_at' | 'activity_log'>): Promise<ProductionOrderRecord> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const order: ProductionOrderRecord = {
        ...data, id: `po_${Date.now()}`, order_number: `PROD-${3000 + mockProductionOrders.length}`,
        actual_quantity: 0, status: 'planned', created_at: new Date().toISOString(),
        activity_log: [{ id: `al_${Date.now()}`, timestamp: new Date().toISOString(), action: 'Production order created', performed_by: data.created_by }],
      };
      mockProductionOrders.push(order);
      return order;
    }
    const res = await apiClient.post<ProductionOrderRecord>('/production/orders', data);
    return res.data;
  }

  static async updateStatus(id: string, status: ProductionStatus, staffName: string): Promise<ProductionOrderRecord> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const order = mockProductionOrders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      order.status = status;
      if (status === 'in_progress') order.started_at = new Date().toISOString();
      if (status === 'cancelled') { order.materials.forEach(m => { m.status = 'released'; }); EventBus.dispatch(EVENT_TYPES.PRODUCTION_CANCELLED, { order_id: id }); }
      order.activity_log.push({ id: `al_${Date.now()}`, timestamp: new Date().toISOString(), action: `Status changed to ${status}`, performed_by: staffName });
      return order;
    }
    const res = await apiClient.patch<ProductionOrderRecord>(`/production/orders/${id}/status`, { status, staff_name: staffName });
    return res.data;
  }

  static async completeOrder(id: string, actualQuantity: number, materialUsage: Record<string, number>, staffName: string): Promise<ProductionOrderRecord> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const order = mockProductionOrders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      order.actual_quantity = actualQuantity;
      order.status = actualQuantity < order.planned_quantity ? 'partially_completed' : 'completed';
      order.completed_at = new Date().toISOString();
      order.materials.forEach(m => { m.actual_used = materialUsage[m.raw_material_id] ?? m.reserved_quantity; m.status = 'consumed'; });
      order.activity_log.push({ id: `al_${Date.now()}`, timestamp: new Date().toISOString(), action: `Production ${order.status === 'partially_completed' ? 'partially completed' : 'completed'} – ${actualQuantity}${order.unit} produced`, performed_by: staffName });
      EventBus.dispatch(EVENT_TYPES.PRODUCTION_COMPLETED, { order_id: id, quantity: actualQuantity });
      return order;
    }
    const res = await apiClient.post<ProductionOrderRecord>(`/production/orders/${id}/complete`, { actual_quantity: actualQuantity, material_usage: materialUsage, staff_name: staffName });
    return res.data;
  }

  static async getStats() {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<{ planned: number; inProgress: number; completedToday: number; reservationValue: number }>('/production/stats'); return res.data; }
    await delay();
    const planned = mockProductionOrders.filter(o => o.status === 'planned').length;
    const inProgress = mockProductionOrders.filter(o => o.status === 'in_progress').length;
    const today = new Date().toISOString().slice(0, 10);
    const completedToday = mockProductionOrders.filter(o => o.completed_at?.startsWith(today)).length;
    const reservationValue = mockProductionOrders.filter(o => ['planned', 'in_progress'].includes(o.status)).reduce((s, o) => s + o.materials.reduce((ms, m) => ms + m.reserved_quantity * 1000, 0), 0);
    return { planned, inProgress, completedToday, reservationValue };
  }
}
