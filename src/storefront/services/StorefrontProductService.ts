import type { Product } from '@/types';
import { allProductsMock } from '@/storefront/mock/products';
import { categoriesMock } from '@/storefront/mock/categories';
import env from '@/config/env';
import { apiClient } from '@/storefront/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export interface StorefrontCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export class StorefrontProductService {
  static async getProducts(): Promise<Product[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...allProductsMock]; }
    const res = await apiClient.get<Product[]>('/storefront/products');
    return res.data;
  }

  static async getCategories(): Promise<StorefrontCategory[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...categoriesMock]; }
    const res = await apiClient.get<StorefrontCategory[]>('/storefront/categories');
    return res.data;
  }

  static async getProductById(id: string): Promise<Product | null> {
    if (env.IS_MOCK_MODE) { await delay(); return allProductsMock.find(p => p.id === id) ?? null; }
    const res = await apiClient.get<Product>(`/storefront/products/${id}`);
    return res.data;
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    if (env.IS_MOCK_MODE) { await delay(); return allProductsMock.find(p => p.slug === slug) ?? null; }
    const res = await apiClient.get<Product>(`/storefront/products/slug/${slug}`);
    return res.data;
  }
}
