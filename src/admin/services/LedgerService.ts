import type { Account, JournalEntry, BankTransaction, Expense } from '@/types';
import { mockAccounts, mockJournalEntries, mockBankTransactions, mockExpenses, mockSupplierLedger, mockCustomerLedger } from '@/admin/mock/ledger';
import type { SupplierLedgerEntry, CustomerLedgerEntry } from '@/types';
import { EventBus, EVENT_TYPES } from '@/admin/services/EventBus';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class LedgerService {
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    EventBus.subscribe(EVENT_TYPES.PURCHASE_BILL_CREATED, (payload: Record<string, unknown>) => {
      const entry: JournalEntry = {
        id: `je_auto_${Date.now()}`, entry_number: `JE-AUTO-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: `Purchase bill ${payload.bill_number || ''}`,
        reference_type: 'Purchase Bill', reference_id: String(payload.id || ''),
        lines: [
          { id: `jl_${Date.now()}_1`, journal_entry_id: '', account_id: 'acc_4001', account_name: 'Purchases / COGS', debit_paisa: Number(payload.subtotal_paisa || 0), credit_paisa: 0 },
          { id: `jl_${Date.now()}_2`, journal_entry_id: '', account_id: 'acc_5002', account_name: 'GST Receivable / ITC', debit_paisa: Number(payload.total_gst_paisa || 0), credit_paisa: 0 },
          { id: `jl_${Date.now()}_3`, journal_entry_id: '', account_id: 'acc_2001', account_name: 'Accounts Payable', debit_paisa: 0, credit_paisa: Number(payload.total_paisa || 0) },
        ],
        created_by: 'system', created_at: new Date().toISOString(),
      };
      mockJournalEntries.push(entry);
    });

    EventBus.subscribe(EVENT_TYPES.SUPPLIER_PAYMENT_MADE, (payload: Record<string, unknown>) => {
      const entry: JournalEntry = {
        id: `je_auto_${Date.now()}`, entry_number: `JE-AUTO-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: `Payment to supplier`,
        reference_type: 'Payment', reference_id: String(payload.id || ''),
        lines: [
          { id: `jl_${Date.now()}_1`, journal_entry_id: '', account_id: 'acc_2001', account_name: 'Accounts Payable', debit_paisa: Number(payload.amount_paisa || 0), credit_paisa: 0 },
          { id: `jl_${Date.now()}_2`, journal_entry_id: '', account_id: payload.mode === 'cash' ? 'acc_1001' : 'acc_1002', account_name: payload.mode === 'cash' ? 'Cash' : 'Bank', debit_paisa: 0, credit_paisa: Number(payload.amount_paisa || 0) },
        ],
        created_by: 'system', created_at: new Date().toISOString(),
      };
      mockJournalEntries.push(entry);
    });

    EventBus.subscribe(EVENT_TYPES.EXPENSE_RECORDED, (payload: Record<string, unknown>) => {
      const entry: JournalEntry = {
        id: `je_auto_${Date.now()}`, entry_number: `JE-AUTO-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: `Expense: ${payload.description || ''}`,
        reference_type: 'Expense', reference_id: String(payload.id || ''),
        lines: [
          { id: `jl_${Date.now()}_1`, journal_entry_id: '', account_id: 'acc_4003', account_name: 'Expenses', debit_paisa: Number(payload.amount_paisa || 0), credit_paisa: 0 },
          { id: `jl_${Date.now()}_2`, journal_entry_id: '', account_id: payload.payment_mode === 'cash' ? 'acc_1001' : 'acc_1002', account_name: payload.payment_mode === 'cash' ? 'Cash' : 'Bank', debit_paisa: 0, credit_paisa: Number(payload.amount_paisa || 0) },
        ],
        created_by: 'system', created_at: new Date().toISOString(),
      };
      mockJournalEntries.push(entry);
    });
  }

  static async getAccounts(): Promise<Account[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockAccounts]; }
    const res = await apiClient.get<Account[]>('/ledger/accounts');
    return res.data;
  }

  static async createAccount(data: Omit<Account, 'id' | 'is_system' | 'balance_paisa' | 'created_at'>): Promise<Account> {
    if (env.IS_MOCK_MODE) { await delay(); const acc: Account = { ...data, id: `acc_${Date.now()}`, is_system: false, balance_paisa: 0, created_at: new Date().toISOString() }; mockAccounts.push(acc); return acc; }
    const res = await apiClient.post<Account>('/ledger/accounts', data);
    return res.data;
  }

  static async getJournalEntries(): Promise<JournalEntry[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockJournalEntries]; }
    const res = await apiClient.get<JournalEntry[]>('/ledger/journal-entries');
    return res.data;
  }

  static async createJournalEntry(data: Omit<JournalEntry, 'id' | 'entry_number' | 'created_at'>): Promise<JournalEntry> {
    if (env.IS_MOCK_MODE) { await delay(); const entry: JournalEntry = { ...data, id: `je_${Date.now()}`, entry_number: `JE-${String(mockJournalEntries.length + 1).padStart(3, '0')}`, created_at: new Date().toISOString() }; mockJournalEntries.push(entry); return entry; }
    const res = await apiClient.post<JournalEntry>('/ledger/journal-entries', data);
    return res.data;
  }

  static async getSupplierLedger(supplierId?: string): Promise<SupplierLedgerEntry[]> {
    if (env.IS_MOCK_MODE) { await delay(); return supplierId ? mockSupplierLedger.filter(e => e.supplier_id === supplierId) : [...mockSupplierLedger]; }
    const res = await apiClient.get<SupplierLedgerEntry[]>('/ledger/supplier', supplierId ? { supplier_id: supplierId } : undefined);
    return res.data;
  }

  static async getSupplierSummary(): Promise<{ supplier_id: string; supplier_name: string; total_billed: number; total_paid: number; outstanding: number; last_txn_date: string; overdue: boolean }[]> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<Awaited<ReturnType<typeof LedgerService.getSupplierSummary>>>('/ledger/supplier/summary'); return res.data; }
    await delay();
    const map = new Map<string, { name: string; billed: number; paid: number; lastDate: string }>();
    for (const e of mockSupplierLedger) {
      if (!map.has(e.supplier_id)) map.set(e.supplier_id, { name: e.supplier_name, billed: 0, paid: 0, lastDate: e.date });
      const s = map.get(e.supplier_id)!;
      s.billed += e.credit_paisa; s.paid += e.debit_paisa;
      if (e.date > s.lastDate) s.lastDate = e.date;
    }
    return Array.from(map.entries()).map(([id, s]) => ({
      supplier_id: id, supplier_name: s.name, total_billed: s.billed, total_paid: s.paid, outstanding: s.billed - s.paid, last_txn_date: s.lastDate,
      overdue: s.billed - s.paid > 0 && new Date(s.lastDate) < new Date(Date.now() - 30 * 86400000),
    }));
  }

  static async getCustomerLedger(customerId?: string): Promise<CustomerLedgerEntry[]> {
    if (env.IS_MOCK_MODE) { await delay(); return customerId ? mockCustomerLedger.filter(e => e.customer_id === customerId) : [...mockCustomerLedger]; }
    const res = await apiClient.get<CustomerLedgerEntry[]>('/ledger/customer', customerId ? { customer_id: customerId } : undefined);
    return res.data;
  }

  static async getCustomerSummary(): Promise<{ customer_id: string; customer_name: string; total_invoiced: number; total_received: number; outstanding: number; last_txn_date: string; overdue: boolean }[]> {
    if (!env.IS_MOCK_MODE) { const res = await apiClient.get<Awaited<ReturnType<typeof LedgerService.getCustomerSummary>>>('/ledger/customer/summary'); return res.data; }
    await delay();
    const map = new Map<string, { name: string; invoiced: number; received: number; lastDate: string }>();
    for (const e of mockCustomerLedger) {
      if (!map.has(e.customer_id)) map.set(e.customer_id, { name: e.customer_name, invoiced: 0, received: 0, lastDate: e.date });
      const c = map.get(e.customer_id)!;
      c.invoiced += e.debit_paisa; c.received += e.credit_paisa;
      if (e.date > c.lastDate) c.lastDate = e.date;
    }
    return Array.from(map.entries()).map(([id, c]) => ({
      customer_id: id, customer_name: c.name, total_invoiced: c.invoiced, total_received: c.received, outstanding: c.invoiced - c.received, last_txn_date: c.lastDate,
      overdue: c.invoiced - c.received > 0 && new Date(c.lastDate) < new Date(Date.now() - 30 * 86400000),
    }));
  }

  static async getExpenses(): Promise<Expense[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockExpenses]; }
    const res = await apiClient.get<Expense[]>('/ledger/expenses');
    return res.data;
  }

  static async createExpense(data: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const exp: Expense = { ...data, id: `exp_${Date.now()}`, created_at: new Date().toISOString() };
      mockExpenses.push(exp);
      EventBus.dispatch(EVENT_TYPES.EXPENSE_RECORDED, { id: exp.id, description: exp.description, amount_paisa: exp.amount_paisa, payment_mode: exp.payment_mode });
      return exp;
    }
    const res = await apiClient.post<Expense>('/ledger/expenses', data);
    return res.data;
  }

  static async updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockExpenses.findIndex(e => e.id === id); if (idx === -1) throw new Error('Expense not found'); mockExpenses[idx] = { ...mockExpenses[idx], ...data }; return mockExpenses[idx]; }
    const res = await apiClient.put<Expense>(`/ledger/expenses/${id}`, data);
    return res.data;
  }

  static async deleteExpense(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockExpenses.findIndex(e => e.id === id); if (idx !== -1) mockExpenses.splice(idx, 1); return; }
    await apiClient.delete(`/ledger/expenses/${id}`);
  }

  static async getBankTransactions(): Promise<BankTransaction[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockBankTransactions]; }
    const res = await apiClient.get<BankTransaction[]>('/ledger/bank-transactions');
    return res.data;
  }

  static async matchBankTransaction(txnId: string, journalEntryId: string): Promise<BankTransaction> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockBankTransactions.findIndex(t => t.id === txnId); if (idx === -1) throw new Error('Transaction not found'); mockBankTransactions[idx] = { ...mockBankTransactions[idx], is_reconciled: true, matched_journal_entry_id: journalEntryId }; return mockBankTransactions[idx]; }
    const res = await apiClient.post<BankTransaction>(`/ledger/bank-transactions/${txnId}/match`, { journal_entry_id: journalEntryId });
    return res.data;
  }

  static async unmatchBankTransaction(txnId: string): Promise<BankTransaction> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockBankTransactions.findIndex(t => t.id === txnId); if (idx === -1) throw new Error('Transaction not found'); mockBankTransactions[idx] = { ...mockBankTransactions[idx], is_reconciled: false, matched_journal_entry_id: undefined }; return mockBankTransactions[idx]; }
    const res = await apiClient.post<BankTransaction>(`/ledger/bank-transactions/${txnId}/unmatch`);
    return res.data;
  }

  static async importBankTransactions(txns: Omit<BankTransaction, 'id' | 'imported_at'>[]): Promise<BankTransaction[]> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const imported = txns.map(t => ({ ...t, id: `bt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, imported_at: new Date().toISOString() } as BankTransaction));
      mockBankTransactions.push(...imported);
      return imported;
    }
    const res = await apiClient.post<BankTransaction[]>('/ledger/bank-transactions/import', txns);
    return res.data;
  }
}

LedgerService.initialize();
