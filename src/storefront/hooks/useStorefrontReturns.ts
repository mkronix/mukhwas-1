import { useState, useEffect, useCallback } from 'react';
import type { Return } from '@/types';
import { ReturnService } from '@/storefront/services/ReturnService';

export function useStorefrontReturns() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setReturns(await ReturnService.getReturns()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { returns, loading, refresh: fetch };
}
