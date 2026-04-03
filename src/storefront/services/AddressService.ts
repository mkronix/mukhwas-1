import type { CustomerAddress } from '@/types';
import { addressesMock } from '@/storefront/mock/addresses';
import env from '@/config/env';
import { apiClient } from '@/storefront/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class AddressService {
  static async getAddresses(): Promise<CustomerAddress[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...addressesMock]; }
    const res = await apiClient.get<CustomerAddress[]>('/storefront/addresses');
    return res.data;
  }

  static async addAddress(data: Omit<CustomerAddress, 'id'>): Promise<CustomerAddress> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const addr: CustomerAddress = { ...data, id: `addr_${Date.now()}` };
      addressesMock.push(addr);
      return addr;
    }
    const res = await apiClient.post<CustomerAddress>('/storefront/addresses', data);
    return res.data;
  }

  static async updateAddress(id: string, data: Partial<CustomerAddress>): Promise<CustomerAddress> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const idx = addressesMock.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('Address not found');
      addressesMock[idx] = { ...addressesMock[idx], ...data };
      return addressesMock[idx];
    }
    const res = await apiClient.put<CustomerAddress>(`/storefront/addresses/${id}`, data);
    return res.data;
  }

  static async deleteAddress(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const idx = addressesMock.findIndex(a => a.id === id);
      if (idx !== -1) addressesMock.splice(idx, 1);
      return;
    }
    await apiClient.delete(`/storefront/addresses/${id}`);
  }
}
