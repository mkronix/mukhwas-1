import { useState, useEffect, useCallback } from 'react';
import type { Order } from '@/types';
import { ordersMock } from '@/storefront/mock/orders';
import env from '@/config/env';
import { apiClient } from '@/storefront/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export function useStorefrontOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      if (env.IS_MOCK_MODE) { await delay(); setOrders([...ordersMock]); }
      else { const res = await apiClient.get<Order[]>('/storefront/orders'); setOrders(res.data); }
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { orders, loading, refresh: fetch };
}

export function useStorefrontOrder(id: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        if (env.IS_MOCK_MODE) { await delay(); setOrder(ordersMock.find(o => o.id === id) ?? null); }
        else { const res = await apiClient.get<Order>(`/storefront/orders/${id}`); setOrder(res.data); }
      } finally { setLoading(false); }
    })();
  }, [id]);
  return { order, loading };
}
