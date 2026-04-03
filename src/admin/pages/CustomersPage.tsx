import React, { useState, useMemo } from 'react';
import { useCustomers, useCustomerOrders } from '@/admin/hooks/useOrders';
import { DataTableOne } from '@/components/ui/data-table';
import type { DataTableOneColumn } from '@/components/ui/data-table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Mail, Phone, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { formatINR } from '@/admin/lib/format';
import type { Customer, Order } from '@/types';
import { useOrders } from '@/admin/hooks/useOrders';

const AdminCustomersPage: React.FC = () => {
  const { customers, loading } = useCustomers();
  const { orders: allOrders } = useOrders();
  const [search, setSearch] = useState('');
  const [filterVerified, setFilterVerified] = useState('all');
  const [drawer, setDrawer] = useState<Customer | null>(null);
  const [drawerTab, setDrawerTab] = useState('overview');

  const enriched = useMemo(() => customers.map(c => {
    const custOrders = allOrders.filter(o => o.customer_id === c.id && o.status !== 'cancelled');
    return {
      ...c,
      totalOrders: custOrders.length,
      totalSpend: custOrders.reduce((s, o) => s + o.total_paisa, 0),
      lastOrderDate: custOrders.length > 0 ? custOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at : null,
    };
  }), [customers, allOrders]);

  const filtered = useMemo(() => {
    let list = enriched;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
    }
    if (filterVerified !== 'all') list = list.filter(c => filterVerified === 'verified' ? c.is_verified : !c.is_verified);
    return list;
  }, [enriched, search, filterVerified]);

  const columns: DataTableOneColumn<typeof enriched[0]>[] = [
    { key: 'customer', header: 'Customer', sortable: true, sortValue: c => c.name,
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
              {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[13px] font-medium text-foreground">{c.name}</p>
            <p className="text-[11px] text-muted-foreground">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (c) => <span className="text-[13px] text-muted-foreground">{c.phone}</span> },
    { key: 'verified', header: 'Verified',
      render: (c) => c.is_verified
        ? <Badge variant="secondary" className="text-[10px] bg-success/10 text-success">Verified</Badge>
        : <Badge variant="secondary" className="text-[10px] bg-warning/10 text-warning">Unverified</Badge>,
    },
    { key: 'orders', header: 'Orders', sortable: true, sortValue: c => c.totalOrders,
      render: (c) => <span className="text-[13px] text-foreground">{c.totalOrders}</span> },
    { key: 'spend', header: 'Total Spend', sortable: true, sortValue: c => c.totalSpend,
      render: (c) => <span className="text-[13px] font-medium text-foreground">{formatINR(c.totalSpend)}</span> },
    { key: 'joined', header: 'Joined',
      render: (c) => <span className="text-[13px] text-muted-foreground">{format(new Date(c.created_at), 'MMM dd, yyyy')}</span> },
    { key: 'actions', header: '',
      render: (c) => (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setDrawer(c); setDrawerTab('overview'); }}>
          <Eye className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  const drawerCustomerOrders = useMemo(() => {
    if (!drawer) return [];
    return allOrders.filter(o => o.customer_id === drawer.id);
  }, [drawer, allOrders]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Customers</h2>

      <DataTableOne
        columns={columns}
        data={filtered}
        keyExtractor={c => c.id}
        loading={loading}
        emptyMessage="No customers found"
        toolbarFilters={
          <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 w-48 text-xs" />
        }
        filters={[
          { key: 'verified', label: 'Status', value: filterVerified,
            options: [{ label: 'Verified', value: 'verified' }, { label: 'Unverified', value: 'unverified' }],
            onChange: setFilterVerified },
        ]}
      />

      <Sheet open={!!drawer} onOpenChange={(open) => !open && setDrawer(null)}>
        <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{drawer?.name}</SheetTitle>
          </SheetHeader>
          {drawer && (
            <Tabs value={drawerTab} onValueChange={setDrawerTab} className="mt-4">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span>{drawer.email}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span>{drawer.phone}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /><span>Joined {format(new Date(drawer.created_at), 'MMM dd, yyyy')}</span></div>
                  <div className="flex items-center gap-2 text-sm">
                    {drawer.is_verified ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <XCircle className="h-3.5 w-3.5 text-warning" />}
                    <span>{drawer.is_verified ? 'Email Verified' : 'Unverified'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{drawerCustomerOrders.filter(o => o.status !== 'cancelled').length}</p>
                    <p className="text-[11px] text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="border border-border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{formatINR(drawerCustomerOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_paisa, 0))}</p>
                    <p className="text-[11px] text-muted-foreground">Total Spend</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="orders" className="mt-4">
                {drawerCustomerOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {drawerCustomerOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="text-[13px] font-medium text-foreground">{o.order_number}</p>
                          <p className="text-[11px] text-muted-foreground">{format(new Date(o.created_at), 'MMM dd, yyyy')} · {o.items.length} items</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-semibold text-foreground">{formatINR(o.total_paisa)}</p>
                          <Badge variant="secondary" className="text-[10px]">{o.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminCustomersPage;
