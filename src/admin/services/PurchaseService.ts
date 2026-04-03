import { mockPurchaseOrders, mockPurchaseBills, mockPurchaseReturns } from '@/admin/mock/purchases';
import type { PurchaseOrderRecord, PurchaseBillRecord, PurchaseReturnRecord } from '@/types';
import { EventBus, EVENT_TYPES } from '@/admin/services/EventBus';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class PurchaseService {
  static async getOrders(): Promise<PurchaseOrderRecord[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockPurchaseOrders]; }
    const res = await apiClient.get<PurchaseOrderRecord[]>('/purchases/orders');
    return res.data;
  }

  static async getOrderById(id: string): Promise<PurchaseOrderRecord | null> {
    if (env.IS_MOCK_MODE) { await delay(); return mockPurchaseOrders.find(o => o.id === id) ?? null; }
    const res = await apiClient.get<PurchaseOrderRecord>(`/purchases/orders/${id}`);
    return res.data;
  }

  static async createOrder(data: Omit<PurchaseOrderRecord, 'id' | 'po_number'>): Promise<PurchaseOrderRecord> {
    if (env.IS_MOCK_MODE) { await delay(); const order: PurchaseOrderRecord = { ...data, id: `po_pur_${Date.now()}`, po_number: `PO-${1100 + mockPurchaseOrders.length}` }; mockPurchaseOrders.push(order); return order; }
    const res = await apiClient.post<PurchaseOrderRecord>('/purchases/orders', data);
    return res.data;
  }

  static async updateOrderStatus(id: string, status: PurchaseOrderRecord['status']): Promise<void> {
    if (env.IS_MOCK_MODE) { await delay(); const order = mockPurchaseOrders.find(o => o.id === id); if (order) order.status = status; return; }
    await apiClient.patch(`/purchases/orders/${id}/status`, { status });
  }

  static async getBills(): Promise<PurchaseBillRecord[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockPurchaseBills]; }
    const res = await apiClient.get<PurchaseBillRecord[]>('/purchases/bills');
    return res.data;
  }

  static async getBillById(id: string): Promise<PurchaseBillRecord | null> {
    if (env.IS_MOCK_MODE) { await delay(); return mockPurchaseBills.find(b => b.id === id) ?? null; }
    const res = await apiClient.get<PurchaseBillRecord>(`/purchases/bills/${id}`);
    return res.data;
  }

  static async createBill(data: Omit<PurchaseBillRecord, 'id'>): Promise<PurchaseBillRecord> {
    if (env.IS_MOCK_MODE) { await delay(); const bill: PurchaseBillRecord = { ...data, id: `bill_${Date.now()}` }; mockPurchaseBills.push(bill); EventBus.dispatch(EVENT_TYPES.PURCHASE_BILL_CREATED, { bill_id: bill.id }); return bill; }
    const res = await apiClient.post<PurchaseBillRecord>('/purchases/bills', data);
    return res.data;
  }

  static async recordPayment(billId: string, amount: number, date: string, mode: string, reference: string): Promise<void> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const bill = mockPurchaseBills.find(b => b.id === billId);
      if (!bill) throw new Error('Bill not found');
      bill.paid_amount_paisa += amount;
      bill.payments.push({ id: `pay_${Date.now()}`, amount_paisa: amount, date, mode, reference });
      bill.payment_status = bill.paid_amount_paisa >= bill.total_paisa ? 'paid' : 'partial';
      EventBus.dispatch(EVENT_TYPES.SUPPLIER_PAYMENT_MADE, { bill_id: billId, amount });
      return;
    }
    await apiClient.post(`/purchases/bills/${billId}/payments`, { amount, date, mode, reference });
  }

  static async getReturns(): Promise<PurchaseReturnRecord[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockPurchaseReturns]; }
    const res = await apiClient.get<PurchaseReturnRecord[]>('/purchases/returns');
    return res.data;
  }

  static async createReturn(data: Omit<PurchaseReturnRecord, 'id' | 'return_id'>): Promise<PurchaseReturnRecord> {
    if (env.IS_MOCK_MODE) { await delay(); const ret: PurchaseReturnRecord = { ...data, id: `pr_${Date.now()}`, return_id: `RET-P${100 + mockPurchaseReturns.length}` }; mockPurchaseReturns.push(ret); EventBus.dispatch(EVENT_TYPES.PURCHASE_RETURN_CREATED, { return_id: ret.id }); return ret; }
    const res = await apiClient.post<PurchaseReturnRecord>('/purchases/returns', data);
    return res.data;
  }

  static async updateReturnStatus(id: string, status: PurchaseReturnRecord['status']): Promise<void> {
    if (env.IS_MOCK_MODE) { await delay(); const ret = mockPurchaseReturns.find(r => r.id === id); if (ret) ret.status = status; return; }
    await apiClient.patch(`/purchases/returns/${id}/status`, { status });
  }
}
