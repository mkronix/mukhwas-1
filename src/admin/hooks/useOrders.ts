import { useState, useEffect, useCallback } from 'react';
import type { Order, Customer } from '@/types';
import { OrderService } from '@/admin/services/OrderService';
import { CustomerService } from '@/admin/services/CustomerService';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setOrders(await OrderService.getAll()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { orders, loading, refresh: fetch };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setCustomers(await CustomerService.getAll()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { customers, loading, refresh: fetch };
}

export function useCustomerOrders(customerId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const fetch = useCallback(async () => {
    if (!customerId) { setOrders([]); return; }
    setLoading(true);
    try { setOrders(await CustomerService.getOrdersForCustomer(customerId)); } finally { setLoading(false); }
  }, [customerId]);
  useEffect(() => { fetch(); }, [fetch]);
  return { orders, loading, refresh: fetch };
}
