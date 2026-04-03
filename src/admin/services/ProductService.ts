import type { Product, Category, Subcategory } from '@/types';
import { mockProducts, mockCategories, mockSubcategories } from '@/admin/mock';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class ProductService {
  static async getAll(): Promise<Product[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockProducts]; }
    const res = await apiClient.get<Product[]>('/products');
    return res.data;
  }

  static async getById(id: string): Promise<Product | null> {
    if (env.IS_MOCK_MODE) { await delay(); return mockProducts.find(p => p.id === id) ?? null; }
    const res = await apiClient.get<Product>(`/products/${id}`);
    return res.data;
  }

  static async create(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const product: Product = { ...data, id: `prod_${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockProducts.push(product);
      return product;
    }
    const res = await apiClient.post<Product>('/products', data);
    return res.data;
  }

  static async update(id: string, data: Partial<Product>): Promise<Product> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const idx = mockProducts.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Product not found');
      mockProducts[idx] = { ...mockProducts[idx], ...data, updated_at: new Date().toISOString() };
      return mockProducts[idx];
    }
    const res = await apiClient.put<Product>(`/products/${id}`, data);
    return res.data;
  }

  static async archive(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const idx = mockProducts.findIndex(p => p.id === id);
      if (idx !== -1) mockProducts[idx].is_active = false;
      return;
    }
    await apiClient.patch(`/products/${id}/archive`);
  }
}

export class CategoryService {
  static async getAll(): Promise<Category[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockCategories].sort((a, b) => a.sort_order - b.sort_order); }
    const res = await apiClient.get<Category[]>('/categories');
    return res.data;
  }

  static async getSubcategories(categoryId: string): Promise<Subcategory[]> {
    if (env.IS_MOCK_MODE) { await delay(); return mockSubcategories.filter(s => s.category_id === categoryId).sort((a, b) => a.sort_order - b.sort_order); }
    const res = await apiClient.get<Subcategory[]>(`/categories/${categoryId}/subcategories`);
    return res.data;
  }

  static async getAllSubcategories(): Promise<Subcategory[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockSubcategories]; }
    const res = await apiClient.get<Subcategory[]>('/subcategories');
    return res.data;
  }

  static async create(data: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const cat: Category = { ...data, id: `cat_${Date.now()}`, created_at: new Date().toISOString() };
      mockCategories.push(cat);
      return cat;
    }
    const res = await apiClient.post<Category>('/categories', data);
    return res.data;
  }

  static async update(id: string, data: Partial<Category>): Promise<Category> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const idx = mockCategories.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Category not found');
      mockCategories[idx] = { ...mockCategories[idx], ...data };
      return mockCategories[idx];
    }
    const res = await apiClient.put<Category>(`/categories/${id}`, data);
    return res.data;
  }

  static async delete(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const idx = mockCategories.findIndex(c => c.id === id);
      if (idx !== -1) mockCategories.splice(idx, 1);
      return;
    }
    await apiClient.delete(`/categories/${id}`);
  }

  static async createSubcategory(data: Omit<Subcategory, 'id'>): Promise<Subcategory> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const sub: Subcategory = { ...data, id: `sub_${Date.now()}` };
      mockSubcategories.push(sub);
      return sub;
    }
    const res = await apiClient.post<Subcategory>('/subcategories', data);
    return res.data;
  }

  static async updateSubcategory(id: string, data: Partial<Subcategory>): Promise<Subcategory> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const idx = mockSubcategories.findIndex(s => s.id === id);
      if (idx === -1) throw new Error('Subcategory not found');
      mockSubcategories[idx] = { ...mockSubcategories[idx], ...data };
      return mockSubcategories[idx];
    }
    const res = await apiClient.put<Subcategory>(`/subcategories/${id}`, data);
    return res.data;
  }

  static async deleteSubcategory(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const idx = mockSubcategories.findIndex(s => s.id === id);
      if (idx !== -1) mockSubcategories.splice(idx, 1);
      return;
    }
    await apiClient.delete(`/subcategories/${id}`);
  }

  static getProductCount(categoryId: string): number {
    return mockProducts.filter(p => p.category_id === categoryId).length;
  }
}
