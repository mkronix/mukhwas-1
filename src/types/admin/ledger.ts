import type { PaymentMode } from '../shared/enums';

export interface Account {
    id: string;
    name: string;
    code: string;
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    parent_id?: string;
    is_system: boolean;
    balance_paisa: number;
    created_at: string;
}

export interface JournalEntry {
    id: string;
    entry_number: string;
    date: string;
    description: string;
    reference_type?: string;
    reference_id?: string;
    lines: JournalEntryLine[];
    created_by: string;
    created_at: string;
}

export interface JournalEntryLine {
    id: string;
    journal_entry_id: string;
    account_id: string;
    account_name: string;
    debit_paisa: number;
    credit_paisa: number;
    narration?: string;
}

export interface Expense {
    id: string;
    category: string;
    description: string;
    amount_paisa: number;
    payment_mode: PaymentMode;
    receipt_url?: string;
    date: string;
    created_by: string;
    journal_entry_id?: string;
    created_at: string;
}

export interface BankTransaction {
    id: string;
    bank_account_id: string;
    date: string;
    description: string;
    reference_number?: string;
    debit_paisa: number;
    credit_paisa: number;
    balance_paisa: number;
    is_reconciled: boolean;
    matched_journal_entry_id?: string;
    imported_at: string;
}