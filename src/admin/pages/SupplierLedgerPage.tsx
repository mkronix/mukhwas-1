import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LedgerService } from '@/admin/services/LedgerService';
import { DataTableOne } from '@/components/ui/data-table';
import type { DataTableOneColumn } from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import type { SupplierLedgerEntry } from '@/types';

const fmt = (p: number) => `₹${(Math.abs(p) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

type SupplierSummary = { supplier_id: string; supplier_name: string; total_billed: number; total_paid: number; outstanding: number; last_txn_date: string; overdue: boolean };

const SupplierLedgerPage: React.FC = () => {
  const [summary, setSummary] = useState<SupplierSummary[]>([]);
  const [ledger, setLedger] = useState<SupplierLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([LedgerService.getSupplierSummary(), LedgerService.getSupplierLedger(selectedSupplier === 'all' ? undefined : selectedSupplier)]);
      setSummary(s); setLedger(l);
    } finally { setLoading(false); }
  }, [selectedSupplier]);

  useEffect(() => { loadData(); }, [loadData]);

  const selected = useMemo(() => summary.find(s => s.supplier_id === selectedSupplier), [summary, selectedSupplier]);

  const summaryColumns: DataTableOneColumn<SupplierSummary>[] = [
    { key: 'name', header: 'Supplier', sortable: true, sortValue: s => s.supplier_name, render: s => <span className="text-[13px] font-medium text-foreground">{s.supplier_name}</span> },
    { key: 'billed', header: 'Total Billed', align: 'right', render: s => <span className="text-[13px]">{fmt(s.total_billed)}</span> },
    { key: 'paid', header: 'Total Paid', align: 'right', render: s => <span className="text-[13px]">{fmt(s.total_paid)}</span> },
    { key: 'outstanding', header: 'Outstanding', align: 'right', render: s => <span className={`text-[13px] font-semibold ${s.outstanding > 0 ? 'text-warning' : 'text-success'}`}>{fmt(s.outstanding)}</span> },
    { key: 'last', header: 'Last Txn', render: s => <span className="text-[13px] text-muted-foreground">{format(new Date(s.last_txn_date), 'dd MMM')}</span> },
    { key: 'overdue', header: 'Status', render: s => s.overdue ? <Badge className="text-[10px] bg-destructive/10 text-destructive border-0">Overdue</Badge> : s.outstanding > 0 ? <Badge className="text-[10px] bg-warning/10 text-warning border-0">Due</Badge> : <Badge className="text-[10px] bg-success/10 text-success border-0">Settled</Badge> },
  ];

  const ledgerColumns: DataTableOneColumn<SupplierLedgerEntry>[] = [
    { key: 'date', header: 'Date', sortable: true, sortValue: e => e.date, render: e => <span className="text-[13px]">{format(new Date(e.date), 'dd MMM yyyy')}</span> },
    { key: 'desc', header: 'Description', render: e => <span className="text-[13px] text-muted-foreground">{e.description}</span> },
    { key: 'ref', header: 'Reference', render: e => <Badge variant="outline" className="text-[10px]">{e.reference_id}</Badge> },
    { key: 'debit', header: 'Paid (Dr)', align: 'right', render: e => <span className="text-[13px]">{e.debit_paisa ? fmt(e.debit_paisa) : '—'}</span> },
    { key: 'credit', header: 'Billed (Cr)', align: 'right', render: e => <span className={`text-[13px] ${e.credit_paisa ? 'text-success' : ''}`}>{e.credit_paisa ? fmt(e.credit_paisa) : '—'}</span> },
    { key: 'balance', header: 'Balance', align: 'right', render: e => <span className="text-[13px] font-medium">{fmt(e.balance_paisa)}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Supplier Ledger</h2>
      </div>

      <div className="max-w-xs">
        <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
          <SelectTrigger><SelectValue placeholder="All Suppliers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {summary.map(s => <SelectItem key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {selectedSupplier !== 'all' && selected && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div><p className="text-sm font-semibold text-foreground">{selected.supplier_name}</p></div>
              <div className="flex gap-6 text-sm">
                <div><span className="text-muted-foreground">Billed:</span> <span className="font-medium">{fmt(selected.total_billed)}</span></div>
                <div><span className="text-muted-foreground">Paid:</span> <span className="font-medium">{fmt(selected.total_paid)}</span></div>
                <div><span className="text-muted-foreground">Outstanding:</span> <span className={`font-semibold ${selected.outstanding > 0 ? 'text-warning' : 'text-success'}`}>{fmt(selected.outstanding)}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? <Skeleton className="h-64" /> : selectedSupplier === 'all' ? (
        <DataTableOne columns={[...summaryColumns, { key: 'view', header: '', render: (s: SupplierSummary) => <button className="text-primary text-xs hover:underline" onClick={() => setSelectedSupplier(s.supplier_id)}>View</button> }]} data={summary} keyExtractor={s => s.supplier_id} emptyMessage="No supplier ledger data" />
      ) : (
        <DataTableOne columns={ledgerColumns} data={ledger} keyExtractor={e => e.id} emptyMessage="No ledger entries for this supplier" />
      )}
    </div>
  );
};

export default SupplierLedgerPage;
