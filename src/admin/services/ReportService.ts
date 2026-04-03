import { mockOrders, mockProducts, mockStaff } from '@/admin/mock';
import { mockFinishedGoods, mockRawMaterials, mockStockMovements } from '@/admin/mock/inventory';
import { mockProductionOrders } from '@/admin/mock/production';
import { mockPurchaseOrders, mockPurchaseBills } from '@/admin/mock/purchases';
import { mockExpenses } from '@/admin/mock/ledger';
import { mockSalaryRecords } from '@/admin/mock/salary';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';
import { formatINR } from '@/lib/format';

const delay = (ms = 250) => new Promise(r => setTimeout(r, ms));

function toCsvBlob(headers: string[], rows: string[][]): Blob {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  return new Blob([csv], { type: 'text/csv' });
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export interface ReportSummary {
  title: string;
  key: string;
  description: string;
  stats: { label: string; value: string }[];
}

// Raw data types for report tables
export interface SalesReportRow { id: string; order_number: string; customer_id: string; status: string; total_paisa: number; payment: string; date: string; }
export interface InventoryReportRow { id: string; product: string; variant: string; sku: string; stock: number; reorder: number; status: string; }
export interface ProductionReportRow { id: string; order_number: string; recipe: string; status: string; planned: number; actual: number; date: string; }
export interface ProcurementReportRow { id: string; po_number: string; supplier: string; status: string; total_paisa: number; date: string; }
export interface FinancialReportRow { id: string; category: string; description: string; amount_paisa: number; date: string; }
export interface StaffReportRow { id: string; staff_id: string; period_start: string; period_end: string; days: number; net_paisa: number; }

export class ReportService {
  // Summary report methods
  static async getSalesReport(): Promise<ReportSummary> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<ReportSummary>('/reports/sales'); return res.data; }
    await delay();
    const totalRev = mockOrders.reduce((s, o) => s + o.total_paisa, 0);
    const delivered = mockOrders.filter(o => o.status === 'delivered').length;
    const pending = mockOrders.filter(o => ['placed', 'confirmed', 'packed'].includes(o.status)).length;
    return { title: 'Sales Report', key: 'sales', description: 'Revenue, orders, and delivery metrics', stats: [{ label: 'Total Revenue', value: formatINR(totalRev) }, { label: 'Total Orders', value: String(mockOrders.length) }, { label: 'Delivered', value: String(delivered) }, { label: 'Pending', value: String(pending) }] };
  }

  static async getInventoryReport(): Promise<ReportSummary> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<ReportSummary>('/reports/inventory'); return res.data; }
    await delay();
    return { title: 'Inventory Report', key: 'inventory', description: 'Stock levels and movement summary', stats: [{ label: 'Finished Goods SKUs', value: String(mockFinishedGoods.length) }, { label: 'Low Stock Items', value: String(mockFinishedGoods.filter(f => f.status === 'low_stock').length) }, { label: 'Raw Materials', value: String(mockRawMaterials.length) }, { label: 'Total Movements', value: String(mockStockMovements.length) }] };
  }

  static async getProductionReport(): Promise<ReportSummary> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<ReportSummary>('/reports/production'); return res.data; }
    await delay();
    return { title: 'Production Report', key: 'production', description: 'Production order stats', stats: [{ label: 'Total Orders', value: String(mockProductionOrders.length) }, { label: 'Completed', value: String(mockProductionOrders.filter(p => p.status === 'completed').length) }, { label: 'In Progress', value: String(mockProductionOrders.filter(p => p.status === 'in_progress').length) }, { label: 'Planned', value: String(mockProductionOrders.filter(p => p.status === 'planned').length) }] };
  }

  static async getProcurementReport(): Promise<ReportSummary> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<ReportSummary>('/reports/procurement'); return res.data; }
    await delay();
    const totalBilled = mockPurchaseBills.reduce((s, b) => s + b.total_paisa, 0);
    return { title: 'Procurement Report', key: 'procurement', description: 'Purchase orders and bills', stats: [{ label: 'Purchase Orders', value: String(mockPurchaseOrders.length) }, { label: 'Bills Total', value: formatINR(totalBilled) }, { label: 'Unpaid Bills', value: String(mockPurchaseBills.filter(b => b.payment_status === 'pending').length) }, { label: 'Active POs', value: String(mockPurchaseOrders.filter(p => ['draft', 'sent'].includes(p.status)).length) }] };
  }

  static async getFinancialReport(): Promise<ReportSummary> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<ReportSummary>('/reports/financial'); return res.data; }
    await delay();
    const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount_paisa, 0);
    const totalRevenue = mockOrders.reduce((s, o) => s + o.total_paisa, 0);
    return { title: 'Financial Report', key: 'financial', description: 'Revenue vs expenses summary', stats: [{ label: 'Total Revenue', value: formatINR(totalRevenue) }, { label: 'Total Expenses', value: formatINR(totalExpenses) }, { label: 'Net Profit', value: formatINR(totalRevenue - totalExpenses) }, { label: 'Expense Entries', value: String(mockExpenses.length) }] };
  }

  static async getStaffReport(): Promise<ReportSummary> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<ReportSummary>('/reports/staff'); return res.data; }
    await delay();
    const totalSalary = mockSalaryRecords.reduce((s, r) => s + r.net_payable_paisa, 0);
    return { title: 'Staff & Salary Report', key: 'staff', description: 'Staff salary and payout summary', stats: [{ label: 'Total Staff', value: String(mockStaff.filter(s => s.email !== 'developer@mukhwas.com').length) }, { label: 'Total Salary Paid', value: formatINR(totalSalary) }, { label: 'Salary Records', value: String(mockSalaryRecords.length) }, { label: 'Active Staff', value: String(mockStaff.filter(s => !s.is_locked && s.email !== 'developer@mukhwas.com').length) }] };
  }

  // Table data methods
  static async getSalesData(): Promise<SalesReportRow[]> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<SalesReportRow[]>('/reports/sales/data'); return res.data; }
    await delay();
    return mockOrders.map(o => ({ id: o.id, order_number: o.order_number, customer_id: o.customer_id, status: o.status, total_paisa: o.total_paisa, payment: o.payment_status, date: o.created_at }));
  }

  static async getInventoryData(): Promise<InventoryReportRow[]> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<InventoryReportRow[]>('/reports/inventory/data'); return res.data; }
    await delay();
    return mockFinishedGoods.map(f => ({ id: f.id, product: f.product_name, variant: f.variant_name, sku: f.sku, stock: f.current_stock, reorder: f.reorder_level, status: f.status }));
  }

  static async getProductionData(): Promise<ProductionReportRow[]> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<ProductionReportRow[]>('/reports/production/data'); return res.data; }
    await delay();
    return mockProductionOrders.map(p => ({ id: p.id, order_number: p.order_number, recipe: p.recipe_name, status: p.status, planned: p.planned_quantity, actual: p.actual_quantity, date: p.created_at }));
  }

  static async getProcurementData(): Promise<ProcurementReportRow[]> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<ProcurementReportRow[]>('/reports/procurement/data'); return res.data; }
    await delay();
    return mockPurchaseOrders.map(p => ({ id: p.id, po_number: p.po_number, supplier: p.supplier_name, status: p.status, total_paisa: p.total_paisa, date: p.order_date }));
  }

  static async getFinancialData(): Promise<FinancialReportRow[]> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<FinancialReportRow[]>('/reports/financial/data'); return res.data; }
    await delay();
    return mockExpenses.map(e => ({ id: e.id, category: e.category, description: e.description, amount_paisa: e.amount_paisa, date: e.date }));
  }

  static async getStaffData(): Promise<StaffReportRow[]> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<StaffReportRow[]>('/reports/staff/data'); return res.data; }
    await delay();
    return mockSalaryRecords.map(r => ({ id: r.id, staff_id: r.staff_id, period_start: r.period_start, period_end: r.period_end, days: r.days_worked, net_paisa: r.net_payable_paisa }));
  }

  // Export methods
  static async exportSalesCSV(): Promise<void> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<{ url: string }>('/reports/sales/export'); window.open(res.data.url); return; }
    await delay();
    downloadBlob(toCsvBlob(['Order Number', 'Customer ID', 'Status', 'Total', 'Payment', 'Date'], mockOrders.map(o => [o.order_number, o.customer_id, o.status, formatINR(o.total_paisa), o.payment_status, o.created_at])), 'sales_report.csv');
  }

  static async exportInventoryCSV(): Promise<void> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<{ url: string }>('/reports/inventory/export'); window.open(res.data.url); return; }
    await delay();
    downloadBlob(toCsvBlob(['Product', 'Variant', 'SKU', 'Stock', 'Reorder Level', 'Status'], mockFinishedGoods.map(f => [f.product_name, f.variant_name, f.sku, String(f.current_stock), String(f.reorder_level), f.status])), 'inventory_report.csv');
  }

  static async exportProductionCSV(): Promise<void> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<{ url: string }>('/reports/production/export'); window.open(res.data.url); return; }
    await delay();
    downloadBlob(toCsvBlob(['Order Number', 'Recipe', 'Status', 'Planned Qty', 'Actual Qty', 'Date'], mockProductionOrders.map(p => [p.order_number, p.recipe_name, p.status, String(p.planned_quantity), String(p.actual_quantity), p.created_at])), 'production_report.csv');
  }

  static async exportProcurementCSV(): Promise<void> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<{ url: string }>('/reports/procurement/export'); window.open(res.data.url); return; }
    await delay();
    downloadBlob(toCsvBlob(['PO Number', 'Supplier', 'Status', 'Total', 'Date'], mockPurchaseOrders.map(p => [p.po_number, p.supplier_name, p.status, formatINR(p.total_paisa), p.order_date])), 'procurement_report.csv');
  }

  static async exportFinancialCSV(): Promise<void> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<{ url: string }>('/reports/financial/export'); window.open(res.data.url); return; }
    await delay();
    downloadBlob(toCsvBlob(['Category', 'Description', 'Amount', 'Date'], mockExpenses.map(e => [e.category, e.description, formatINR(e.amount_paisa), e.date])), 'financial_report.csv');
  }

  static async exportStaffCSV(): Promise<void> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<{ url: string }>('/reports/staff/export'); window.open(res.data.url); return; }
    await delay();
    downloadBlob(toCsvBlob(['Staff ID', 'Period Start', 'Period End', 'Days Worked', 'Net Payable'], mockSalaryRecords.map(r => [r.staff_id, r.period_start, r.period_end, String(r.days_worked), formatINR(r.net_payable_paisa)])), 'staff_salary_report.csv');
  }

  static async getAllReports(): Promise<ReportSummary[]> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<ReportSummary[]>('/reports'); return res.data; }
    const [sales, inventory, production, procurement, financial, staff] = await Promise.all([
      this.getSalesReport(), this.getInventoryReport(), this.getProductionReport(),
      this.getProcurementReport(), this.getFinancialReport(), this.getStaffReport(),
    ]);
    return [sales, inventory, production, procurement, financial, staff];
  }
}
