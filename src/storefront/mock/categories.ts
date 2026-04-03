import type { Category } from '@/types';

export const categoriesMock: Category[] = [
  { id: 'cat_mukhwas', name: 'Mukhwas', slug: 'mukhwas', description: 'Classic mouth freshener blends', sort_order: 1, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat_saunf', name: 'Saunf Mixes', slug: 'saunf-mixes', description: 'Sweet fennel-based varieties', sort_order: 2, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat_pan', name: 'Pan Flavours', slug: 'pan-flavours', description: 'Paan-inspired mukhwas blends', sort_order: 3, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat_dry_fruits', name: 'Dry Fruit Mix', slug: 'dry-fruit-mix', description: 'Premium dry fruit mukhwas', sort_order: 4, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat_special', name: 'Special Blends', slug: 'special-blends', description: 'Signature handcrafted blends', sort_order: 5, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat_gift', name: 'Gift Boxes', slug: 'gift-boxes', description: 'Curated gift assortments', sort_order: 6, is_active: true, created_at: '2024-01-01T00:00:00Z' },
];
