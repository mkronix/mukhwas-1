import { useState, useEffect, useCallback } from 'react';
import type { SystemUnit, CustomUnit, UnitConversion } from '@/types';
import { UnitService } from '@/admin/services/UnitService';

export function useUnits() {
  const [systemUnits, setSystemUnits] = useState<SystemUnit[]>([]);
  const [customUnits, setCustomUnits] = useState<CustomUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([UnitService.getSystemUnits(), UnitService.getCustomUnits()]);
      setSystemUnits(s);
      setCustomUnits(c);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { systemUnits, customUnits, loading, refresh: fetch };
}

export function useConversions() {
  const [conversions, setConversions] = useState<UnitConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setConversions(await UnitService.getConversions()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { conversions, loading, refresh: fetch };
}
