import { useState, useEffect, useCallback } from 'react';
import type { Lead } from '@/types';
import { LeadService } from '@/admin/services/LeadService';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setLeads(await LeadService.getAll()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { leads, loading, refresh: fetch };
}
