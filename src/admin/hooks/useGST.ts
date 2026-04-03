import { useState, useEffect, useCallback } from 'react';
import type { GSTConfig, GSTReportRow } from '@/types';
import { AdminGSTService } from '@/admin/services/AdminGSTService';

export function useGSTConfig() {
  const [config, setConfig] = useState<GSTConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setConfig(await AdminGSTService.getConfig()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { config, loading, refresh: fetch };
}

export function useGSTR1(month?: string) {
  const [data, setData] = useState<GSTReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await AdminGSTService.getGSTR1(month)); } finally { setLoading(false); }
  }, [month]);
  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refresh: fetch };
}

export function useGSTR2(month?: string) {
  const [data, setData] = useState<GSTReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await AdminGSTService.getGSTR2(month)); } finally { setLoading(false); }
  }, [month]);
  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refresh: fetch };
}
