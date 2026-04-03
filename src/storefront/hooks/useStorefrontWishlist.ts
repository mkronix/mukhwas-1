import { useState, useEffect, useCallback } from 'react';
import type { Wishlist, Product } from '@/types';
import { WishlistService } from '@/storefront/services/WishlistService';
import { StorefrontProductService } from '@/storefront/services/StorefrontProductService';

export function useStorefrontWishlist() {
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [wl, prods] = await Promise.all([
        WishlistService.getWishlist(),
        StorefrontProductService.getProducts(),
      ]);
      setWishlist(wl);
      const wishlisted = wl.map(w => {
        return prods.find(p => p.variants.some(v => v.id === w.variant_id));
      }).filter(Boolean) as Product[];
      setProducts(wishlisted);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { wishlist, products, loading, refresh: fetch };
}
