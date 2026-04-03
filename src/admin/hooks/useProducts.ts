import { useState, useEffect, useCallback } from 'react';
import type { Product, Category, Subcategory } from '@/types';
import { ProductService, CategoryService } from '@/admin/services/ProductService';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c, s] = await Promise.all([
        ProductService.getAll(),
        CategoryService.getAll(),
        CategoryService.getAllSubcategories(),
      ]);
      setProducts(p);
      setCategories(c);
      setSubcategories(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, categories, subcategories, loading, refresh: fetch };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([
        CategoryService.getAll(),
        CategoryService.getAllSubcategories(),
      ]);
      setCategories(c);
      setSubcategories(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { categories, subcategories, loading, refresh: fetch };
}
