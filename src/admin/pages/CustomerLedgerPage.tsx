import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LedgerService } from '@/admin/services/LedgerService';
import { DataTableOne } from '@/components/ui/data-table';
import type { DataTableOneColumn } from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import type { CustomerLedgerEntry } from '@/types';

const fmt = (p: number) => `₹${(Math.abs(p) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

type CustomerSummary = { customer_id: string; customer_name: string; total_invoiced: number; total_received: number; outstanding: number; last_txn_date: string; overdue: boolean };

const CustomerLedgerPage: React.FC = () => {
  const [summary, setSummary] = useState<CustomerSummary[]>([]);
  const [ledger, setLedger] = useState<CustomerLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([LedgerService.getCustomerSummary(), LedgerService.getCustomerLedger(selectedCustomer === 'all' ? undefined : selectedCustomer)]);
      setSummary(s); setLedger(l);
    } finally { setLoading(false); }
  }, [selectedCustomer]);

  useEffect(() => { loadData(); }, [loadData]);

  const selected = useMemo(() => summary.find(c => c.customer_id === selectedCustomer), [summary, selectedCustomer]);

  const summaryColumns: DataTableOneColumn<CustomerSummary>[] = [
    { key: 'name', header: 'Customer', sortable: true, sortValue: c => c.customer_name, render: c => <span className="text-[13px] font-medium text-foreground">{c.customer_name}</span> },
    { key: 'invoiced', header: 'Total Invoiced', align: 'right', render: c => <span className="text-[13px]">{fmt(c.total_invoiced)}</span> },
    { key: 'received', header: 'Total Received', align: 'right', render: c => <span className="text-[13px]">{fmt(c.total_received)}</span> },
    { key: 'outstanding', header: 'Outstanding', align: 'right', render: c => <span className={`text-[13px] font-semibold ${c.outstanding > 0 ? 'text-warning' : 'text-success'}`}>{fmt(c.outstanding)}</span> },
    { key: 'last', header: 'Last Txn', render: c => <span className="text-[13px] text-muted-foreground">{format(new Date(c.last_txn_date), 'dd MMM')}</span> },
    { key: 'status', header: 'Status', render: c => c.outstanding <= 0 ? <Badge className="text-[10px] bg-success/10 text-success border-0">Settled</Badge> : c.overdue ? <Badge className="text-[10px] bg-destructive/10 text-destructive border-0">Overdue</Badge> : <Badge className="text-[10px] bg-warning/10 text-warning border-0">Due</Badge> },
  ];

  const ledgerColumns: DataTableOneColumn<CustomerLedgerEntry>[] = [
    { key: 'date', header: 'Date', sortable: true, sortValue: e => e.date, render: e => <span className="text-[13px]">{format(new Date(e.date), 'dd MMM yyyy')}</span> },
    { key: 'desc', header: 'Description', render: e => <span className="text-[13px] text-muted-foreground">{e.description}</span> },
    { key: 'ref', header: 'Reference', render: e => <Badge variant="outline" className="text-[10px]">{e.reference_id}</Badge> },
    { key: 'debit', header: 'Invoiced (Dr)', align: 'right', render: e => <span className="text-[13px]">{e.debit_paisa ? fmt(e.debit_paisa) : '—'}</span> },
    { key: 'credit', header: 'Received (Cr)', align: 'right', render: e => <span className={`text-[13px] ${e.credit_paisa ? 'text-success' : ''}`}>{e.credit_paisa ? fmt(e.credit_paisa) : '—'}</span> },
    { key: 'balance', header: 'Balance', align: 'right', render: e => <span className="text-[13px] font-medium">{fmt(e.balance_paisa)}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Customer Ledger</h2>
      </div>

      <div className="max-w-xs">
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger><SelectValue placeholder="All Customers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {summary.map(c => <SelectItem key={c.customer_id} value={c.customer_id}>{c.customer_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {selectedCustomer !== 'all' && selected && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div><p className="text-sm font-semibold text-foreground">{selected.customer_name}</p></div>
              <div className="flex gap-6 text-sm">
                <div><span className="text-muted-foreground">Invoiced:</span> <span className="font-medium">{fmt(selected.total_invoiced)}</span></div>
                <div><span className="text-muted-foreground">Received:</span> <span className="font-medium">{fmt(selected.total_received)}</span></div>
                <div><span className="text-muted-foreground">Receivable:</span> <span className={`font-semibold ${selected.outstanding > 0 ? 'text-warning' : 'text-success'}`}>{fmt(selected.outstanding)}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? <Skeleton className="h-64" /> : selectedCustomer === 'all' ? (
        <DataTableOne columns={[...summaryColumns, { key: 'view', header: '', render: (c: CustomerSummary) => <button className="text-primary text-xs hover:underline" onClick={() => setSelectedCustomer(c.customer_id)}>View</button> }]} data={summary} keyExtractor={c => c.customer_id} emptyMessage="No customer ledger data" />
      ) : (
        <DataTableOne columns={ledgerColumns} data={ledger} keyExtractor={e => e.id} emptyMessage="No ledger entries for this customer" />
      )}
    </div>
  );
};

export default CustomerLedgerPage;
