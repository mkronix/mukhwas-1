import React, { useState, useMemo } from 'react';
import { useOrders, useCustomers } from '@/admin/hooks/useOrders';
import { OrderService } from '@/admin/services/OrderService';
import { DataTableOne } from '@/components/ui/data-table';
import type { DataTableOneColumn } from '@/components/ui/data-table';
import { ModalFormField } from '@/components/ui/modal-form-field';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Eye, CheckCircle2, Circle, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatINR, orderStatusConfig, paymentStatusConfig } from '@/admin/lib/format';
import type { Order, OrderStatus } from '@/types';

const TIMELINE_STEPS: OrderStatus[] = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];

const VALID_NEXT: Record<string, OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['shipped'],
  shipped: ['delivered'],
};

const AdminOrdersPage: React.FC = () => {
  const { orders, loading, refresh } = useOrders();
  const { customers } = useCustomers();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [cancelReason, setCancelReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [statusErrors, setStatusErrors] = useState<{ status?: string; reason?: string }>({});

  const getCustomerName = (customerId: string) => customers.find(c => c.id === customerId)?.name ?? '—';
  const getCustomerPhone = (customerId: string) => customers.find(c => c.id === customerId)?.phone ?? '—';

  const filtered = useMemo(() => {
    let list = orders;
    if (tab !== 'all') {
      list = list.filter(o => tab === 'ecommerce' ? true : true);
    }
    if (filterPayment !== 'all') list = list.filter(o => o.payment_status === filterPayment);
    if (filterStatus !== 'all') list = list.filter(o => o.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o => {
        const custName = getCustomerName(o.customer_id);
        return o.order_number.toLowerCase().includes(q) || custName.toLowerCase().includes(q);
      });
    }
    return list;
  }, [orders, customers, tab, filterPayment, filterStatus, search]);

  const statsData = useMemo(() => ({
    pending: orders.filter(o => o.payment_status === 'pending').length,
    processing: orders.filter(o => o.status === 'confirmed' || o.status === 'packed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }), [orders]);

  const handleUpdateStatus = async () => {
    if (!drawerOrder) return;
    if (newStatus === 'cancelled') {
      if (!cancelReason.trim()) {
        setStatusErrors({ reason: 'Cancellation reason is required' });
        return;
      }
    } else if (!newStatus) {
      setStatusErrors({ status: 'Select a status' });
      return;
    }
    setStatusErrors({});
    setUpdating(true);
    try {
      if (newStatus === 'cancelled') {
        await OrderService.cancelOrder(drawerOrder.id, cancelReason);
      } else {
        await OrderService.updateStatus(drawerOrder.id, newStatus);
      }
      toast.success(`Order status updated to ${newStatus}`);
      setStatusModalOpen(false);
      refresh();
      const updated = await OrderService.getById(drawerOrder.id);
      if (updated) setDrawerOrder(updated);
    } finally { setUpdating(false); }
  };

  const columns: DataTableOneColumn<Order>[] = [
    {
      key: 'order', header: 'Order', sortable: true, sortValue: o => o.order_number,
      render: (o) => <span className="text-[13px] font-medium text-foreground">{o.order_number}</span>
    },
    {
      key: 'customer', header: 'Customer',
      render: (o) => <span className="text-[13px] text-foreground">{getCustomerName(o.customer_id)}</span>
    },
    {
      key: 'date', header: 'Date', sortable: true, sortValue: o => new Date(o.created_at).getTime(),
      render: (o) => <span className="text-[13px] text-muted-foreground">{format(new Date(o.created_at), 'MMM dd, yyyy')}</span>
    },
    { key: 'items', header: 'Items', render: (o) => <span className="text-[13px] text-muted-foreground">{o.items.length}</span> },
    {
      key: 'total', header: 'Total', sortable: true, sortValue: o => o.total_paisa,
      render: (o) => <span className="text-[13px] font-semibold text-foreground">{formatINR(o.total_paisa)}</span>
    },
    {
      key: 'payment', header: 'Payment',
      render: (o) => {
        const cfg = paymentStatusConfig[o.payment_status];
        return <Badge variant="secondary" className={`text-[10px] ${cfg?.color}`}>{cfg?.label}</Badge>;
      },
    },
    {
      key: 'status', header: 'Status',
      render: (o) => {
        const cfg = orderStatusConfig[o.status];
        return <Badge variant="secondary" className={`text-[10px] ${cfg?.color}`}>{cfg?.label}</Badge>;
      },
    },
    {
      key: 'actions', header: '',
      render: (o) => (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDrawerOrder(o)}>
          <Eye className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Orders</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Pending Payment', value: statsData.pending, color: 'text-warning' },
          { label: 'Processing', value: statsData.processing, color: 'text-primary' },
          { label: 'Shipped', value: statsData.shipped, color: 'text-info' },
          { label: 'Delivered Today', value: statsData.delivered, color: 'text-success' },
        ].map(s => (
          <Card key={s.label} className="p-4 border border-border">
            <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="ecommerce">Ecommerce</TabsTrigger>
          <TabsTrigger value="pos">POS</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <DataTableOne
            columns={columns}
            data={filtered}
            keyExtractor={o => o.id}
            loading={loading}
            emptyMessage="No orders found"
            toolbarFilters={
              <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 w-48 text-xs" />
            }
            filters={[
              {
                key: 'payment', label: 'Payment', value: filterPayment,
                options: [{ label: 'Pending', value: 'pending' }, { label: 'Paid', value: 'paid' }, { label: 'Failed', value: 'failed' }, { label: 'Refunded', value: 'refunded' }],
                onChange: setFilterPayment
              },
              {
                key: 'status', label: 'Status', value: filterStatus,
                options: Object.entries(orderStatusConfig).map(([k, v]) => ({ label: v.label, value: k })),
                onChange: setFilterStatus
              },
            ]}
          />
        </TabsContent>
      </Tabs>

      <Sheet open={!!drawerOrder} onOpenChange={(open) => !open && setDrawerOrder(null)}>
        <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              Order {drawerOrder?.order_number}
              {drawerOrder && <Badge variant="secondary" className={`text-[10px] ${orderStatusConfig[drawerOrder.status]?.color}`}>{orderStatusConfig[drawerOrder.status]?.label}</Badge>}
            </SheetTitle>
          </SheetHeader>
          {drawerOrder && (() => {
            const validNext = VALID_NEXT[drawerOrder.status] ?? [];
            return (
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium text-foreground">{getCustomerName(drawerOrder.customer_id)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-foreground">{getCustomerPhone(drawerOrder.customer_id)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Items</h4>
                  <div className="border border-border rounded-lg overflow-hidden">
                    {drawerOrder.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between px-3 py-2.5 border-b border-border last:border-0">
                        <div>
                          <p className="text-[13px] font-medium text-foreground">{item.product_name}</p>
                          <p className="text-[11px] text-muted-foreground">{item.variant_name} × {item.quantity}</p>
                        </div>
                        <span className="text-[13px] font-medium text-foreground">{formatINR(item.total_paisa)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(drawerOrder.subtotal_paisa)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatINR(drawerOrder.tax_paisa)}</span></div>
                  {drawerOrder.discount_paisa > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-success">-{formatINR(drawerOrder.discount_paisa)}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{drawerOrder.shipping_paisa > 0 ? formatINR(drawerOrder.shipping_paisa) : 'Free'}</span></div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-border"><span>Total</span><span>{formatINR(drawerOrder.total_paisa)}</span></div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Shipping Address</h4>
                  <p className="text-[13px] text-muted-foreground">
                    {drawerOrder.shipping_address.line1}, {drawerOrder.shipping_address.city}, {drawerOrder.shipping_address.state} - {drawerOrder.shipping_address.pincode}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Order Timeline</h4>
                  <div className="space-y-0">
                    {TIMELINE_STEPS.map((step, i) => {
                      const histEntry = drawerOrder.status_history.find(h => h.status === step);
                      const isCompleted = !!histEntry;
                      const isCurrent = drawerOrder.status === step;
                      return (
                        <div key={step} className="flex gap-3 relative">
                          <div className="flex flex-col items-center">
                            {isCompleted ? (
                              <CheckCircle2 className={`h-5 w-5 shrink-0 ${isCurrent ? 'text-primary' : 'text-success'}`} />
                            ) : (
                              <Circle className="h-5 w-5 shrink-0 text-muted-foreground/30" />
                            )}
                            {i < TIMELINE_STEPS.length - 1 && (
                              <div className={`w-px flex-1 min-h-[24px] ${isCompleted ? 'bg-success' : 'bg-border'}`} />
                            )}
                          </div>
                          <div className="pb-4">
                            <p className={`text-[13px] font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                              {orderStatusConfig[step]?.label}
                            </p>
                            {histEntry && (
                              <p className="text-[11px] text-muted-foreground">
                                {format(new Date(histEntry.timestamp), 'MMM dd, yyyy · HH:mm')}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {validNext.length > 0 && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { setStatusErrors({}); setNewStatus(''); setStatusModalOpen(true); }}>
                      Update Status
                    </Button>
                    {validNext.includes('cancelled') && (
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => { setStatusErrors({}); setNewStatus('cancelled'); setCancelReason(''); setStatusModalOpen(true); }}>
                        Cancel Order
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>

      <ResponsiveModal open={statusModalOpen} onOpenChange={v => { setStatusModalOpen(v); if (!v) setStatusErrors({}); }} title={newStatus === 'cancelled' ? 'Cancel order' : 'Update order status'}>
        <div className="space-y-4 pb-16">
          {newStatus === 'cancelled' ? (
            <>
              <p className="text-sm text-muted-foreground">Are you sure you want to cancel this order?</p>
              <ModalFormField label="Cancellation reason" error={statusErrors.reason}>
                {(id) => (
                  <Input id={id} placeholder="Customer requested / stock issue…" value={cancelReason} onChange={e => { setCancelReason(e.target.value); if (statusErrors.reason) setStatusErrors(p => ({ ...p, reason: undefined })); }} />
                )}
              </ModalFormField>
            </>
          ) : (
            <ModalFormField label="New status" error={statusErrors.status}>
              {(id) => (
                <Select value={newStatus || undefined} onValueChange={v => { setNewStatus(v as OrderStatus); if (statusErrors.status) setStatusErrors(p => ({ ...p, status: undefined })); }}>
                  <SelectTrigger id={id}><SelectValue placeholder="Choose next step" /></SelectTrigger>
                  <SelectContent>
                    {(VALID_NEXT[drawerOrder?.status ?? ''] ?? []).filter(s => s !== 'cancelled').map(s => (
                      <SelectItem key={s} value={s}>{orderStatusConfig[s]?.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </ModalFormField>
          )}
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setStatusModalOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} disabled={updating}
            className={newStatus === 'cancelled' ? 'bg-destructive hover:bg-destructive/90' : ''}>
            {updating ? 'Updating...' : 'Confirm'}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default AdminOrdersPage;
