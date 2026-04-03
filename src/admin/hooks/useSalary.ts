import { useState, useEffect, useCallback } from 'react';
import type { SalaryRecord, SalaryStructureRecord } from '@/types';
import { AdminSalaryService } from '@/admin/services/SalaryService';

export function useSalaryRecords(staffId?: string) {
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setRecords(await AdminSalaryService.getSalaryRecords(staffId)); } finally { setLoading(false); }
  }, [staffId]);
  useEffect(() => { fetch(); }, [fetch]);
  return { records, loading, refresh: fetch };
}

export function useSalaryStructures(staffId: string) {
  const [structures, setStructures] = useState<SalaryStructureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    if (!staffId) { setStructures([]); return; }
    setLoading(true);
    try { setStructures(await AdminSalaryService.getSalaryStructures(staffId)); } finally { setLoading(false); }
  }, [staffId]);
  useEffect(() => { fetch(); }, [fetch]);
  return { structures, loading, refresh: fetch };
}
