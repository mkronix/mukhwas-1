import type { CMSSlider, CMSBanner, Coupon, CustomerReview } from '@/types';
import { mockSliders, mockBanners, mockCoupons, mockReviews } from '@/admin/mock';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class ContentService {
  static async getSliders(): Promise<CMSSlider[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockSliders].sort((a, b) => a.sort_order - b.sort_order); }
    const res = await apiClient.get<CMSSlider[]>('/cms/sliders');
    return res.data;
  }

  static async createSlider(data: Omit<CMSSlider, 'id'>): Promise<CMSSlider> {
    if (env.IS_MOCK_MODE) { await delay(); const s: CMSSlider = { ...data, id: `slide_${Date.now()}` }; mockSliders.push(s); return s; }
    const res = await apiClient.post<CMSSlider>('/cms/sliders', data);
    return res.data;
  }

  static async updateSlider(id: string, data: Partial<CMSSlider>): Promise<CMSSlider> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockSliders.findIndex(s => s.id === id); if (idx === -1) throw new Error('Slider not found'); mockSliders[idx] = { ...mockSliders[idx], ...data }; return mockSliders[idx]; }
    const res = await apiClient.put<CMSSlider>(`/cms/sliders/${id}`, data);
    return res.data;
  }

  static async deleteSlider(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockSliders.findIndex(s => s.id === id); if (idx !== -1) mockSliders.splice(idx, 1); return; }
    await apiClient.delete(`/cms/sliders/${id}`);
  }

  static async getBanners(): Promise<CMSBanner[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockBanners]; }
    const res = await apiClient.get<CMSBanner[]>('/cms/banners');
    return res.data;
  }

  static async createBanner(data: Omit<CMSBanner, 'id'>): Promise<CMSBanner> {
    if (env.IS_MOCK_MODE) { await delay(); const b: CMSBanner = { ...data, id: `banner_${Date.now()}` }; mockBanners.push(b); return b; }
    const res = await apiClient.post<CMSBanner>('/cms/banners', data);
    return res.data;
  }

  static async updateBanner(id: string, data: Partial<CMSBanner>): Promise<CMSBanner> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockBanners.findIndex(b => b.id === id); if (idx === -1) throw new Error('Banner not found'); mockBanners[idx] = { ...mockBanners[idx], ...data }; return mockBanners[idx]; }
    const res = await apiClient.put<CMSBanner>(`/cms/banners/${id}`, data);
    return res.data;
  }

  static async deleteBanner(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockBanners.findIndex(b => b.id === id); if (idx !== -1) mockBanners.splice(idx, 1); return; }
    await apiClient.delete(`/cms/banners/${id}`);
  }
}

export class CouponService {
  static async getAll(): Promise<Coupon[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockCoupons]; }
    const res = await apiClient.get<Coupon[]>('/coupons');
    return res.data;
  }

  static async create(data: Omit<Coupon, 'id' | 'created_at' | 'used_count'>): Promise<Coupon> {
    if (env.IS_MOCK_MODE) { await delay(); const c: Coupon = { ...data, id: `coup_${Date.now()}`, used_count: 0, created_at: new Date().toISOString() }; mockCoupons.push(c); return c; }
    const res = await apiClient.post<Coupon>('/coupons', data);
    return res.data;
  }

  static async update(id: string, data: Partial<Coupon>): Promise<Coupon> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockCoupons.findIndex(c => c.id === id); if (idx === -1) throw new Error('Coupon not found'); mockCoupons[idx] = { ...mockCoupons[idx], ...data }; return mockCoupons[idx]; }
    const res = await apiClient.put<Coupon>(`/coupons/${id}`, data);
    return res.data;
  }

  static async delete(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockCoupons.findIndex(c => c.id === id); if (idx !== -1) mockCoupons.splice(idx, 1); return; }
    await apiClient.delete(`/coupons/${id}`);
  }
}

export class ReviewService {
  static async getAll(): Promise<CustomerReview[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockReviews]; }
    const res = await apiClient.get<CustomerReview[]>('/reviews');
    return res.data;
  }

  static async approve(id: string): Promise<CustomerReview> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockReviews.findIndex(r => r.id === id); if (idx === -1) throw new Error('Review not found'); mockReviews[idx].is_approved = true; return mockReviews[idx]; }
    const res = await apiClient.patch<CustomerReview>(`/reviews/${id}/approve`);
    return res.data;
  }

  static async reject(id: string): Promise<CustomerReview> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockReviews.findIndex(r => r.id === id); if (idx === -1) throw new Error('Review not found'); mockReviews[idx].is_approved = false; return mockReviews[idx]; }
    const res = await apiClient.patch<CustomerReview>(`/reviews/${id}/reject`);
    return res.data;
  }

  static async delete(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockReviews.findIndex(r => r.id === id); if (idx !== -1) mockReviews.splice(idx, 1); return; }
    await apiClient.delete(`/reviews/${id}`);
  }
}
