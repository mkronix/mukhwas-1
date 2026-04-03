import type { Account, JournalEntry, BankTransaction, Expense, SupplierLedgerEntry, CustomerLedgerEntry } from '@/types';

export const mockAccounts: Account[] = [
  { id: 'acc_1', name: 'Cash in Hand', code: '1001', type: 'asset', balance_paisa: 5000000, is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc_2', name: 'HDFC Bank - Main', code: '1002', type: 'asset', balance_paisa: 150000000, is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc_3', name: 'Sales Revenue', code: '4001', type: 'revenue', balance_paisa: 250000000, is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc_4', name: 'Purchase Cost', code: '5001', type: 'expense', balance_paisa: 120000000, is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc_5', name: 'Staff Salaries', code: '5002', type: 'expense', balance_paisa: 45000000, is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc_6', name: 'Office Rent', code: '5003', type: 'expense', balance_paisa: 12000000, is_system: true, created_at: '2024-01-01T00:00:00Z' },
];

export const mockJournalEntries: JournalEntry[] = [
  { id: 'je_1', entry_number: 'JE-001', date: '2024-06-01T10:00:00Z', description: 'Monthly Rent Payment', lines: [{ id: 'jel_1a', journal_entry_id: 'je_1', account_id: 'acc_6', account_name: 'Office Rent', debit_paisa: 1000000, credit_paisa: 0 }, { id: 'jel_1b', journal_entry_id: 'je_1', account_id: 'acc_2', account_name: 'HDFC Bank - Main', debit_paisa: 0, credit_paisa: 1000000 }], reference_type: 'expense', reference_id: 'exp_1', created_by: 'system', created_at: '2024-06-01T10:00:00Z' },
  { id: 'je_2', entry_number: 'JE-002', date: '2024-06-02T10:00:00Z', description: 'Sale of Mukhwas', lines: [{ id: 'jel_2a', journal_entry_id: 'je_2', account_id: 'acc_2', account_name: 'HDFC Bank - Main', debit_paisa: 500000, credit_paisa: 0 }, { id: 'jel_2b', journal_entry_id: 'je_2', account_id: 'acc_3', account_name: 'Sales Revenue', debit_paisa: 0, credit_paisa: 500000 }], reference_type: 'sale', reference_id: 'ord_1', created_by: 'system', created_at: '2024-06-02T10:00:00Z' },
  { id: 'je_3', entry_number: 'JE-003', date: '2024-06-03T10:00:00Z', description: 'Purchase of Raw Materials', lines: [{ id: 'jel_3a', journal_entry_id: 'je_3', account_id: 'acc_4', account_name: 'Purchase Cost', debit_paisa: 2500000, credit_paisa: 0 }, { id: 'jel_3b', journal_entry_id: 'je_3', account_id: 'acc_2', account_name: 'HDFC Bank - Main', debit_paisa: 0, credit_paisa: 2500000 }], reference_type: 'purchase', reference_id: 'po_1', created_by: 'system', created_at: '2024-06-03T10:00:00Z' },
];

export const mockBankTransactions: BankTransaction[] = [
  { id: 'bt_1', bank_account_id: 'acc_2', date: '2024-06-01T10:00:00Z', description: 'Rent Payment', debit_paisa: 1000000, credit_paisa: 0, balance_paisa: 149000000, is_reconciled: true, matched_journal_entry_id: 'je_1', imported_at: '2024-06-01T10:00:00Z' },
  { id: 'bt_2', bank_account_id: 'acc_2', date: '2024-06-02T10:00:00Z', description: 'Customer Payment', debit_paisa: 0, credit_paisa: 500000, balance_paisa: 149500000, is_reconciled: true, matched_journal_entry_id: 'je_2', imported_at: '2024-06-02T10:00:00Z' },
  { id: 'bt_3', bank_account_id: 'acc_2', date: '2024-06-03T10:00:00Z', description: 'Supplier Payment', debit_paisa: 2500000, credit_paisa: 0, balance_paisa: 147000000, is_reconciled: false, imported_at: '2024-06-03T10:00:00Z' },
];

export const mockExpenses: Expense[] = [
  { id: 'exp_1', date: '2024-06-01T10:00:00Z', category: 'Rent', amount_paisa: 1000000, description: 'Office Rent', payment_mode: 'net_banking' as any, created_by: 'admin', created_at: '2024-06-01T10:00:00Z' },
  { id: 'exp_2', date: '2024-06-05T10:00:00Z', category: 'Utilities', amount_paisa: 50000, description: 'Electricity Bill', payment_mode: 'cash', created_by: 'admin', created_at: '2024-06-05T10:00:00Z' },
  { id: 'exp_3', date: '2024-06-10T10:00:00Z', category: 'Marketing', amount_paisa: 200000, description: 'Social Media Ads', payment_mode: 'upi', created_by: 'admin', created_at: '2024-06-10T10:00:00Z' },
];

export const mockSupplierLedger: SupplierLedgerEntry[] = [
  { id: 'sle_1', supplier_id: 'sup_1', supplier_name: 'Patel Spices Co.', date: '2024-06-01T10:00:00Z', description: 'Purchase Order PO-1001', reference_type: 'purchase_bill', reference_id: 'pb_1', debit_paisa: 0, credit_paisa: 2500000, balance_paisa: 2500000 },
  { id: 'sle_2', supplier_id: 'sup_1', supplier_name: 'Patel Spices Co.', date: '2024-06-05T10:00:00Z', description: 'Payment Received', reference_type: 'payment', reference_id: 'pay_1', debit_paisa: 1000000, credit_paisa: 0, balance_paisa: 1500000 },
];

export const mockCustomerLedger: CustomerLedgerEntry[] = [
  { id: 'cle_1', customer_id: 'cust_1', customer_name: 'Rajesh Kumar', date: '2024-06-01T10:00:00Z', description: 'Order INV-1001', reference_type: 'sale', reference_id: 'ord_1', debit_paisa: 500000, credit_paisa: 0, balance_paisa: 500000 },
  { id: 'cle_2', customer_id: 'cust_1', customer_name: 'Rajesh Kumar', date: '2024-06-05T10:00:00Z', description: 'Payment Received', reference_type: 'payment', reference_id: 'pay_2', debit_paisa: 0, credit_paisa: 500000, balance_paisa: 0 },
];
