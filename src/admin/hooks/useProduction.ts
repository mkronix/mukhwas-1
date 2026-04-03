import { useState, useEffect, useCallback } from 'react';
import type { ProductionOrderRecord } from '@/types';
import { AdminProductionOrderService } from '@/admin/services/AdminProductionOrderService';

export function useProductionOrders() {
  const [orders, setOrders] = useState<ProductionOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setOrders(await AdminProductionOrderService.getAll()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { orders, loading, refresh: fetch };
}
