import { useState, useEffect, useCallback } from 'react';
import type { JournalEntry, Expense, BankTransaction, Account } from '@/types';
import type { SupplierLedgerEntry, CustomerLedgerEntry } from '@/types';
import { LedgerService } from '@/admin/services/LedgerService';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setAccounts(await LedgerService.getAccounts()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { accounts, loading, refresh: fetch };
}

export function useJournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setEntries(await LedgerService.getJournalEntries()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { entries, loading, refresh: fetch };
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setExpenses(await LedgerService.getExpenses()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { expenses, loading, refresh: fetch };
}

export function useBankTransactions() {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setTransactions(await LedgerService.getBankTransactions()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { transactions, loading, refresh: fetch };
}

export function useSupplierLedger(supplierId?: string) {
  const [entries, setEntries] = useState<SupplierLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setEntries(await LedgerService.getSupplierLedger(supplierId)); } finally { setLoading(false); }
  }, [supplierId]);
  useEffect(() => { fetch(); }, [fetch]);
  return { entries, loading, refresh: fetch };
}

export function useCustomerLedger(customerId?: string) {
  const [entries, setEntries] = useState<CustomerLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setEntries(await LedgerService.getCustomerLedger(customerId)); } finally { setLoading(false); }
  }, [customerId]);
  useEffect(() => { fetch(); }, [fetch]);
  return { entries, loading, refresh: fetch };
}
