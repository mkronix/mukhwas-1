import {
  mockStoreSettings, mockCommerceRules, mockNotificationEvents,
  mockPOSSettings, mockPaymentModes,
} from '@/admin/mock/settings';
import type { StoreSettings, CommerceRules, NotificationEvent, POSSettingsData, PaymentModeConfig } from '@/types';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class SettingsService {
  static async getStoreSettings(): Promise<StoreSettings> {
    if (env.IS_MOCK_MODE) { await delay(); return { ...mockStoreSettings }; }
    const res = await apiClient.get<StoreSettings>('/settings/store');
    return res.data;
  }
  static async updateStoreSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
    if (env.IS_MOCK_MODE) { await delay(); Object.assign(mockStoreSettings, data); return { ...mockStoreSettings }; }
    const res = await apiClient.put<StoreSettings>('/settings/store', data);
    return res.data;
  }

  static async getCommerceRules(): Promise<CommerceRules> {
    if (env.IS_MOCK_MODE) { await delay(); return { ...mockCommerceRules }; }
    const res = await apiClient.get<CommerceRules>('/settings/commerce-rules');
    return res.data;
  }
  static async updateCommerceRules(data: Partial<CommerceRules>): Promise<CommerceRules> {
    if (env.IS_MOCK_MODE) { await delay(); Object.assign(mockCommerceRules, data); return { ...mockCommerceRules }; }
    const res = await apiClient.put<CommerceRules>('/settings/commerce-rules', data);
    return res.data;
  }

  static async getNotificationEvents(): Promise<NotificationEvent[]> {
    if (env.IS_MOCK_MODE) { await delay(); return mockNotificationEvents.map(n => ({ ...n })); }
    const res = await apiClient.get<NotificationEvent[]>('/settings/notifications');
    return res.data;
  }
  static async updateNotificationEvent(id: string, data: Partial<NotificationEvent>): Promise<NotificationEvent> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockNotificationEvents.findIndex(n => n.id === id); if (idx === -1) throw new Error('Event not found'); mockNotificationEvents[idx] = { ...mockNotificationEvents[idx], ...data }; return { ...mockNotificationEvents[idx] }; }
    const res = await apiClient.put<NotificationEvent>(`/settings/notifications/${id}`, data);
    return res.data;
  }

  static async getPOSSettings(): Promise<POSSettingsData> {
    if (env.IS_MOCK_MODE) { await delay(); return { ...mockPOSSettings }; }
    const res = await apiClient.get<POSSettingsData>('/settings/pos');
    return res.data;
  }
  static async updatePOSSettings(data: Partial<POSSettingsData>): Promise<POSSettingsData> {
    if (env.IS_MOCK_MODE) { await delay(); Object.assign(mockPOSSettings, data); return { ...mockPOSSettings }; }
    const res = await apiClient.put<POSSettingsData>('/settings/pos', data);
    return res.data;
  }

  static async getPaymentModes(): Promise<PaymentModeConfig[]> {
    if (env.IS_MOCK_MODE) { await delay(); return mockPaymentModes.map(p => ({ ...p })); }
    const res = await apiClient.get<PaymentModeConfig[]>('/settings/payment-modes');
    return res.data;
  }
  static async updatePaymentMode(id: string, data: Partial<PaymentModeConfig>): Promise<PaymentModeConfig> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockPaymentModes.findIndex(p => p.id === id); if (idx === -1) throw new Error('Payment mode not found'); mockPaymentModes[idx] = { ...mockPaymentModes[idx], ...data }; return { ...mockPaymentModes[idx] }; }
    const res = await apiClient.put<PaymentModeConfig>(`/settings/payment-modes/${id}`, data);
    return res.data;
  }
  static async createPaymentMode(data: Omit<PaymentModeConfig, 'id'>): Promise<PaymentModeConfig> {
    if (env.IS_MOCK_MODE) { await delay(); const pm: PaymentModeConfig = { ...data, id: `pm_${Date.now()}` }; mockPaymentModes.push(pm); return pm; }
    const res = await apiClient.post<PaymentModeConfig>('/settings/payment-modes', data);
    return res.data;
  }
}
