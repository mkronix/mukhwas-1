import { mockProducts, mockOrders, mockCustomers } from '@/admin/mock';
import { mockSuppliers } from '@/admin/mock/suppliers';
import { mockLeads } from '@/admin/mock/leads';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 150) => new Promise(r => setTimeout(r, ms));

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'product' | 'order' | 'customer' | 'supplier' | 'lead';
  route: string;
}

export class SearchService {
  static async search(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    if (!env.IS_MOCK_MODE) {
      const res = await apiClient.get<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`);
      return res.data;
    }

    await delay();
    const q = query.toLowerCase();
    const items: SearchResult[] = [];

    mockProducts.filter(p => p.name.toLowerCase().includes(q) || p.slug.includes(q)).slice(0, 5).forEach(p => {
      items.push({ id: p.id, title: p.name, subtitle: `SKU: ${p.variants[0]?.sku ?? '—'}`, type: 'product', route: `/admin/products?edit=${p.id}` });
    });

    mockOrders.filter(o => o.order_number.toLowerCase().includes(q)).slice(0, 5).forEach(o => {
      items.push({ id: o.id, title: o.order_number, subtitle: `₹${(o.total_paisa / 100).toLocaleString('en-IN')} · ${o.status}`, type: 'order', route: `/admin/orders/${o.id}` });
    });

    mockCustomers.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 5).forEach(c => {
      items.push({ id: c.id, title: c.name, subtitle: c.email, type: 'customer', route: `/admin/customers?edit=${c.id}` });
    });

    mockSuppliers.filter(s => s.name.toLowerCase().includes(q)).slice(0, 3).forEach(s => {
      items.push({ id: s.id, title: s.name, subtitle: s.contact_person, type: 'supplier', route: `/admin/suppliers?edit=${s.id}` });
    });

    mockLeads.filter(l => l.name.toLowerCase().includes(q) || l.phone.includes(q)).slice(0, 3).forEach(l => {
      items.push({ id: l.id, title: l.name, subtitle: `${l.source} · ${l.status}`, type: 'lead', route: `/admin/leads?edit=${l.id}` });
    });

    return items;
  }
}
