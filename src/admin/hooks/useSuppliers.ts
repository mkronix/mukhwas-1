import { useState, useEffect, useCallback } from 'react';
import type { SupplierRecord } from '@/types';
import { SupplierService } from '@/admin/services/SupplierService';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setSuppliers(await SupplierService.getAll()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { suppliers, loading, refresh: fetch };
}
