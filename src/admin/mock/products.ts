
import { allProductsMock } from '@/storefront/mock';
import type { Product, Category, Subcategory } from '@/types';

export const mockCategories: Category[] = [
  { id: 'cat_mukhwas', name: 'Classic Mukhwas', slug: 'classic-mukhwas', description: 'Traditional after-meal mouth fresheners', sort_order: 1, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat_2', name: 'Premium Mukhwas', slug: 'premium-mukhwas', description: 'Luxury handcrafted blends', sort_order: 2, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat_3', name: 'Sugar-Coated', slug: 'sugar-coated', description: 'Sweet candy-style mukhwas', sort_order: 3, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat_4', name: 'Dry Fruits Mix', slug: 'dry-fruits-mix', description: 'Mukhwas with dry fruits and nuts', sort_order: 4, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat_5', name: 'Herbal & Digestive', slug: 'herbal-digestive', description: 'Ayurvedic digestive blends', sort_order: 5, is_active: true, created_at: '2024-02-01T00:00:00Z' },
  { id: 'cat_6', name: 'Gift Boxes', slug: 'gift-boxes', description: 'Festive gift packs', sort_order: 6, is_active: true, created_at: '2024-03-01T00:00:00Z' },
];

export const mockSubcategories: Subcategory[] = [
  { id: 'sub_1', category_id: 'cat_mukhwas', name: 'Fennel Based', slug: 'fennel-based', sort_order: 1, is_active: true },
  { id: 'sub_2', category_id: 'cat_mukhwas', name: 'Sesame Based', slug: 'sesame-based', sort_order: 2, is_active: true },
  { id: 'sub_3', category_id: 'cat_2', name: 'Saffron Infused', slug: 'saffron-infused', sort_order: 1, is_active: true },
  { id: 'sub_4', category_id: 'cat_3', name: 'Candy Coated', slug: 'candy-coated', sort_order: 1, is_active: true },
  { id: 'sub_5', category_id: 'cat_4', name: 'Almonds & Cashew', slug: 'almonds-cashew', sort_order: 1, is_active: true },
];

export const mockProducts: Product[] = [...allProductsMock];
