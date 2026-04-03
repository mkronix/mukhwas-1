import { useState, useEffect, useCallback } from 'react';
import type { PurchaseOrderRecord, PurchaseBillRecord, PurchaseReturnRecord } from '@/types';
import { PurchaseService } from '@/admin/services/PurchaseService';

export function usePurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setOrders(await PurchaseService.getOrders()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { orders, loading, refresh: fetch };
}

export function usePurchaseBills() {
  const [bills, setBills] = useState<PurchaseBillRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setBills(await PurchaseService.getBills()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { bills, loading, refresh: fetch };
}

export function usePurchaseReturns() {
  const [returns, setReturns] = useState<PurchaseReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setReturns(await PurchaseService.getReturns()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { returns, loading, refresh: fetch };
}
