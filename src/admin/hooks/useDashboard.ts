import { useState, useEffect, useCallback } from 'react';
import type { DashboardStats, RevenueDataPoint, CategoryRevenue, LowStockItem, RecentOrder } from '@/admin/services/DashboardService';
import { DashboardService } from '@/admin/services/DashboardService';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueDataPoint[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, c, l, o] = await Promise.all([
        DashboardService.getStats(),
        DashboardService.getRevenueChart(),
        DashboardService.getCategoryRevenue(),
        DashboardService.getLowStockItems(),
        DashboardService.getRecentOrders(),
      ]);
      setStats(s);
      setRevenueChart(r);
      setCategoryRevenue(c);
      setLowStockItems(l);
      setRecentOrders(o);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, revenueChart, categoryRevenue, lowStockItems, recentOrders, loading, refresh: fetch };
}
