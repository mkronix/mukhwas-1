import React, { useState, useMemo } from 'react';
import { usePurchaseOrders, usePurchaseBills, usePurchaseReturns } from '@/admin/hooks/usePurchases';
import { PurchaseService } from '@/admin/services/PurchaseService';
import { DataTableOne } from '@/components/ui/data-table';
import type { DataTableOneColumn } from '@/components/ui/data-table';
import { ModalFormField } from '@/components/ui/modal-form-field';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Eye, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatINR } from '@/admin/lib/format';
import type { PurchaseOrderRecord, PurchaseBillRecord, PurchaseReturnRecord } from '@/types';

const poStatusColors: Record<string, string> = { draft: 'bg-muted text-muted-foreground', sent: 'bg-primary/10 text-primary', received: 'bg-success/10 text-success', billed: 'bg-info/10 text-info', cancelled: 'bg-destructive/10 text-destructive' };
const payStatusColors: Record<string, string> = { pending: 'bg-warning/10 text-warning', partial: 'bg-info/10 text-info', paid: 'bg-success/10 text-success' };
const retStatusColors: Record<string, string> = { requested: 'bg-warning/10 text-warning', approved: 'bg-primary/10 text-primary', sent: 'bg-info/10 text-info', credited: 'bg-success/10 text-success' };

const PurchasesPage: React.FC = () => {
  const { orders, loading: ordersLoading } = usePurchaseOrders();
  const { bills, loading: billsLoading } = usePurchaseBills();
  const { returns, loading: returnsLoading } = usePurchaseReturns();
  const loading = ordersLoading || billsLoading || returnsLoading;
  const [billDrawer, setBillDrawer] = useState(false);
  const [selectedBill, setSelectedBill] = useState<PurchaseBillRecord | null>(null);
  const [payModal, setPayModal] = useState(false);
  const [payAmt, setPayAmt] = useState('');
  const [payMode, setPayMode] = useState('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [saving, setSaving] = useState(false);
  const [payErrors, setPayErrors] = useState<{ amount?: string }>({});

  const poColumns: DataTableOneColumn<PurchaseOrderRecord>[] = [
    { key: 'po', header: 'PO #', render: r => <span className="text-[13px] font-mono text-primary">{r.po_number}</span> },
    { key: 'supplier', header: 'Supplier', render: r => <span className="text-[13px] font-medium text-foreground">{r.supplier_name}</span> },
    { key: 'date', header: 'Date', render: r => <span className="text-[13px] text-muted-foreground">{format(new Date(r.order_date), 'dd MMM yyyy')}</span> },
    { key: 'items', header: 'Items', render: r => <span className="text-[13px] text-muted-foreground">{r.items.length}</span> },
    { key: 'total', header: 'Total', sortable: true, sortValue: r => r.total_paisa, render: r => <span className="text-[13px] font-medium">{formatINR(r.total_paisa)}</span> },
    { key: 'status', header: 'Status', render: r => <Badge variant="secondary" className={`text-[10px] ${poStatusColors[r.status]}`}>{r.status}</Badge> },
  ];

  const billColumns: DataTableOneColumn<PurchaseBillRecord>[] = [
    { key: 'bill', header: 'Bill #', render: r => <span className="text-[13px] font-mono text-primary">{r.bill_number}</span> },
    { key: 'po', header: 'PO Ref', render: r => <span className="text-[13px] text-muted-foreground">{r.po_number}</span> },
    { key: 'supplier', header: 'Supplier', render: r => <span className="text-[13px] font-medium">{r.supplier_name}</span> },
    { key: 'subtotal', header: 'Subtotal', render: r => <span className="text-[13px]">{formatINR(r.subtotal_paisa)}</span> },
    { key: 'gst', header: 'GST', render: r => <span className="text-[13px] text-muted-foreground">{formatINR(r.cgst_paisa + r.sgst_paisa)}</span> },
    { key: 'total', header: 'Total', sortable: true, sortValue: r => r.total_paisa, render: r => <span className="text-[13px] font-medium">{formatINR(r.total_paisa)}</span> },
    { key: 'payment', header: 'Payment', render: r => <Badge variant="secondary" className={`text-[10px] ${payStatusColors[r.payment_status]}`}>{r.payment_status}</Badge> },
    {
      key: 'actions', header: '', render: r => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedBill(r); setBillDrawer(true); }}><Eye className="h-3.5 w-3.5" /></Button>
          {r.payment_status !== 'paid' && <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => { setPayErrors({}); setSelectedBill(r); setPayAmt(String((r.total_paisa - r.paid_amount_paisa) / 100)); setPayRef(''); setPayModal(true); }}><CreditCard className="h-3.5 w-3.5" /></Button>}
        </div>
      )
    },
  ];

  const retColumns: DataTableOneColumn<PurchaseReturnRecord>[] = [
    { key: 'id', header: 'Return ID', render: r => <span className="text-[13px] font-mono text-primary">{r.return_id}</span> },
    { key: 'bill', header: 'Bill Ref', render: r => <span className="text-[13px] text-muted-foreground">{r.bill_number}</span> },
    { key: 'supplier', header: 'Supplier', render: r => <span className="text-[13px] font-medium">{r.supplier_name}</span> },
    { key: 'date', header: 'Date', render: r => <span className="text-[13px] text-muted-foreground">{format(new Date(r.return_date), 'dd MMM yyyy')}</span> },
    { key: 'items', header: 'Items', render: r => <span className="text-[13px] text-muted-foreground">{r.items.length}</span> },
    { key: 'total', header: 'Value', render: r => <span className="text-[13px] font-medium">{formatINR(r.total_paisa)}</span> },
    { key: 'status', header: 'Status', render: r => <Badge variant="secondary" className={`text-[10px] ${retStatusColors[r.status]}`}>{r.status}</Badge> },
  ];

  const handlePayment = async () => {
    if (!selectedBill) return;
    const err: typeof payErrors = {};
    const n = Number(payAmt);
    if (payAmt.trim() === '' || Number.isNaN(n) || n <= 0) err.amount = 'Enter a valid amount in ₹';
    const maxRupee = (selectedBill.total_paisa - selectedBill.paid_amount_paisa) / 100;
    if (!err.amount && n > maxRupee + 0.001) err.amount = `Amount cannot exceed ${maxRupee.toFixed(2)} ₹ outstanding`;
    if (Object.keys(err).length) {
      setPayErrors(err);
      return;
    }
    setPayErrors({});
    setSaving(true);
    try {
      await PurchaseService.recordPayment(selectedBill.id, Number(payAmt) * 100, new Date().toISOString(), payMode, payRef);
      toast.success('Payment recorded'); setPayModal(false);
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Purchases</h2>
      <Tabs defaultValue="orders">
        <TabsList><TabsTrigger value="orders">Purchase Orders</TabsTrigger><TabsTrigger value="bills">Purchase Bills</TabsTrigger><TabsTrigger value="returns">Purchase Returns</TabsTrigger></TabsList>
        <TabsContent value="orders" className="mt-4">
          <DataTableOne columns={poColumns} data={orders} keyExtractor={r => r.id} loading={loading} emptyMessage="No purchase orders" />
        </TabsContent>
        <TabsContent value="bills" className="mt-4">
          <DataTableOne columns={billColumns} data={bills} keyExtractor={r => r.id} loading={loading} emptyMessage="No bills" />
        </TabsContent>
        <TabsContent value="returns" className="mt-4">
          <DataTableOne columns={retColumns} data={returns} keyExtractor={r => r.id} loading={loading} emptyMessage="No returns" />
        </TabsContent>
      </Tabs>

      <Sheet open={billDrawer} onOpenChange={setBillDrawer}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader><SheetTitle>{selectedBill?.bill_number}</SheetTitle></SheetHeader>
          {selectedBill && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-medium">{selectedBill.supplier_name}</p></div>
                <div><p className="text-xs text-muted-foreground">GSTIN</p><p className="font-mono text-xs">{selectedBill.supplier_gstin}</p></div>
                <div><p className="text-xs text-muted-foreground">Bill Date</p><p>{format(new Date(selectedBill.bill_date), 'dd MMM yyyy')}</p></div>
                <div><p className="text-xs text-muted-foreground">Due Date</p><p>{format(new Date(selectedBill.due_date), 'dd MMM yyyy')}</p></div>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead><tr className="border-b bg-muted/30"><th className="text-left p-2">Item</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Rate</th><th className="text-right p-2">CGST</th><th className="text-right p-2">SGST</th><th className="text-right p-2">Total</th></tr></thead>
                  <tbody>{selectedBill.items.map(it => (
                    <tr key={it.id} className="border-b last:border-0"><td className="p-2">{it.raw_material_name}</td><td className="p-2 text-right">{it.quantity}</td><td className="p-2 text-right">{formatINR(it.unit_price_paisa)}</td><td className="p-2 text-right">{formatINR(Math.round(it.gst_amount_paisa / 2))}</td><td className="p-2 text-right">{formatINR(Math.round(it.gst_amount_paisa / 2))}</td><td className="p-2 text-right font-medium">{formatINR(it.total_paisa)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-muted-foreground">Subtotal: {formatINR(selectedBill.subtotal_paisa)}</p>
                <p className="text-sm text-muted-foreground">CGST: {formatINR(selectedBill.cgst_paisa)} | SGST: {formatINR(selectedBill.sgst_paisa)}</p>
                <p className="text-lg font-bold text-foreground">Total: {formatINR(selectedBill.total_paisa)}</p>
              </div>
              <Badge variant="secondary" className={payStatusColors[selectedBill.payment_status]}>{selectedBill.payment_status} — Paid {formatINR(selectedBill.paid_amount_paisa)}</Badge>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ResponsiveModal open={payModal} onOpenChange={v => { setPayModal(v); if (!v) setPayErrors({}); }} title="Record Payment">
        <div className="space-y-4 pb-20">
          <ModalFormField label="Amount" error={payErrors.amount} description="In rupees (₹)">
            {(id) => <Input id={id} type="number" step="0.01" placeholder="12500.00" value={payAmt} onChange={e => { setPayAmt(e.target.value); if (payErrors.amount) setPayErrors(p => ({ ...p, amount: undefined })); }} />}
          </ModalFormField>
          <ModalFormField label="Payment mode">
            {(id) => (
              <Select value={payMode} onValueChange={setPayMode}>
                <SelectTrigger id={id}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            )}
          </ModalFormField>
          <ModalFormField label="Reference" description="UTR, cheque no., or receipt id (optional)">
            {(id) => <Input id={id} placeholder="e.g. UTR 51234…" value={payRef} onChange={e => setPayRef(e.target.value)} />}
          </ModalFormField>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPayModal(false)}>Cancel</Button>
          <Button onClick={handlePayment} disabled={saving}>{saving ? 'Recording...' : 'Confirm Payment'}</Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default PurchasesPage;
