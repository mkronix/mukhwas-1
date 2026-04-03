import { useState, useEffect, useCallback } from 'react';
import type { CustomerAddress } from '@/types';
import { AddressService } from '@/storefront/services/AddressService';

export function useStorefrontAddresses() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setAddresses(await AddressService.getAddresses()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { addresses, loading, refresh: fetch };
}
