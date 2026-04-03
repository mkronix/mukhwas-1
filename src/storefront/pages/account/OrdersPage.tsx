import React from 'react';
import { Link } from 'react-router-dom';
import { useStorefrontOrders } from '@/storefront/hooks/useStorefrontOrders';
import { formatPrice } from '@/lib/format';

const statusColor: Record<string, string> = {
  placed: 'bg-info-muted text-info', confirmed: 'bg-info-muted text-info',
  packed: 'bg-warning-muted text-warning', shipped: 'bg-warning-muted text-warning',
  delivered: 'bg-success-muted text-success', cancelled: 'bg-destructive-muted text-destructive',
};

const AccountOrdersPage: React.FC = () => {
  const { orders } = useStorefrontOrders();
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tight text-foreground mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-bold text-foreground mb-2">No orders yet</p>
          <p className="text-sm text-muted-foreground mb-4">Start shopping to see your orders here.</p>
          <Link to="/store" className="text-sm font-bold text-primary hover:underline">Browse Products</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(o => (
            <Link key={o.id} to={`/account/orders/${o.id}`}
              className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm transition-shadow">
              <div>
                <p className="text-sm font-bold text-foreground">{o.order_number}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.items.length} item{o.items.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ${statusColor[o.status]}`}>{o.status}</span>
                <span className="text-base font-black text-foreground">{formatPrice(o.total_paisa)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountOrdersPage;
