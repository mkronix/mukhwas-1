import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/types';
import { StorefrontProductService, type StorefrontCategory } from '@/storefront/services/StorefrontProductService';

export function useStorefrontProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        StorefrontProductService.getProducts(),
        StorefrontProductService.getCategories(),
      ]);
      setProducts(p);
      setCategories(c);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { products, categories, loading, refresh: fetch };
}
