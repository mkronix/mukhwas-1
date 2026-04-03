import type { CMSSlider, CMSBanner, Coupon } from '@/types';

export const mockSliders: CMSSlider[] = [
  { id: 'slide_1', title: 'Diwali Special Collection', image_url: '/placeholder.svg', link_url: '/store?category=gift-boxes', sort_order: 1, is_active: true },
  { id: 'slide_2', title: 'Premium Mukhwas Range', image_url: '/placeholder.svg', link_url: '/store?category=premium-mukhwas', sort_order: 2, is_active: true },
  { id: 'slide_3', title: 'New: Herbal Digestive Blends', image_url: '/placeholder.svg', link_url: '/store?category=herbal-digestive', sort_order: 3, is_active: false },
];

export const mockBanners: CMSBanner[] = [
  { id: 'banner_1', title: 'Free shipping on orders above ₹499', subtitle: 'Limited time offer', image_url: '/placeholder.svg', link_url: '/store', position: 'top', is_active: true },
  { id: 'banner_2', title: 'Use code FIRST10 for 10% off', image_url: '/placeholder.svg', link_url: '/store', position: 'top', is_active: true },
];

export const mockCoupons: Coupon[] = [
  {
    id: 'coup_1', code: 'FIRST10', description: '10% off on first order', discount_type: 'percentage', value: 10,
    min_order_paisa: 30000, max_discount_paisa: 20000, surface: 'storefront', usage_limit: 500, used_count: 142,
    expiry_date: '2025-12-31T23:59:59Z', is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'coup_2', code: 'FLAT50', description: '₹50 off on orders above ₹300', discount_type: 'flat_amount', value: 5000,
    min_order_paisa: 30000, surface: 'both', usage_limit: 1000, used_count: 387,
    expiry_date: '2025-06-30T23:59:59Z', is_active: true, created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'coup_3', code: 'DIWALI25', description: '25% off Diwali special', discount_type: 'percentage', value: 25,
    min_order_paisa: 50000, max_discount_paisa: 50000, surface: 'storefront', usage_limit: 200, used_count: 198,
    expiry_date: '2024-11-15T23:59:59Z', is_active: false, created_at: '2024-10-01T00:00:00Z',
  },
  {
    id: 'coup_4', code: 'WELCOME20', description: '20% off for new customers', discount_type: 'percentage', value: 20,
    min_order_paisa: 20000, max_discount_paisa: 30000, surface: 'storefront', usage_limit: 300, used_count: 56,
    expiry_date: '2026-03-31T23:59:59Z', is_active: true, created_at: '2024-06-01T00:00:00Z',
  },
];
