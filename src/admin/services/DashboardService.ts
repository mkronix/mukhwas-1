import { mockOrders, mockProducts, mockCustomers } from '@/admin/mock';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export interface DashboardStats {
  todayRevenue: number;
  revenueTrend: number;
  ordersToday: number;
  ordersTrend: number;
  lowStockCount: number;
  pendingOrders: number;
}

export interface RevenueDataPoint { date: string; revenue: number; }
export interface CategoryRevenue { name: string; value: number; }
export interface LowStockItem { productName: string; variantName: string; currentStock: number; reorderLevel: number; sku: string; }
export interface RecentOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  status: string;
  total_paisa: number;
  created_at: string;
}

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<DashboardStats>('/dashboard/stats'); return res.data; }
    await delay(250);
    const totalRevenue = mockOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_paisa, 0);
    const lowStockItems = mockProducts.flatMap(p => p.variants).filter(v => v.is_active && v.stock_quantity <= v.low_stock_threshold);
    const pendingOrders = mockOrders.filter(o => o.status === 'placed' || o.status === 'confirmed').length;
    return { todayRevenue: totalRevenue, revenueTrend: 12.5, ordersToday: mockOrders.filter(o => o.status !== 'cancelled').length, ordersTrend: 8.3, lowStockCount: lowStockItems.length, pendingOrders };
  }

  static async getRevenueChart(): Promise<RevenueDataPoint[]> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<RevenueDataPoint[]>('/dashboard/revenue-chart'); return res.data; }
    await delay(300);
    const points: RevenueDataPoint[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); points.push({ date: d.toISOString().split('T')[0], revenue: Math.floor(Math.random() * 50000 + 20000) }); }
    return points;
  }

  static async getCategoryRevenue(): Promise<CategoryRevenue[]> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<CategoryRevenue[]>('/dashboard/category-revenue'); return res.data; }
    await delay(200);
    return [{ name: 'Classic', value: 125000 }, { name: 'Premium', value: 210000 }, { name: 'Sugar-Coated', value: 85000 }, { name: 'Dry Fruits', value: 175000 }, { name: 'Herbal', value: 65000 }, { name: 'Gift Boxes', value: 290000 }];
  }

  static async getLowStockItems(): Promise<LowStockItem[]> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<LowStockItem[]>('/dashboard/low-stock'); return res.data; }
    await delay(200);
    return mockProducts.flatMap(p => p.variants.map(v => ({ productName: p.name, variantName: v.name, currentStock: v.stock_quantity, reorderLevel: v.low_stock_threshold, sku: v.sku }))).filter(i => i.currentStock <= i.reorderLevel).slice(0, 10);
  }

  static async getRecentOrders(): Promise<RecentOrder[]> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<RecentOrder[]>('/dashboard/recent-orders'); return res.data; }
    await delay(200);
    return mockOrders.slice(0, 5).map(o => ({
      id: o.id,
      order_number: o.order_number,
      customer_id: o.customer_id,
      customer_name: mockCustomers.find(c => c.id === o.customer_id)?.name ?? '—',
      status: o.status,
      total_paisa: o.total_paisa,
      created_at: o.created_at,
    }));
  }
}
