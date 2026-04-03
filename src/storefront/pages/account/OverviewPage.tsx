import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Package, ArrowRight } from 'lucide-react';
import { useStorefrontOrders } from '@/storefront/hooks/useStorefrontOrders';
import { useStorefrontWishlist } from '@/storefront/hooks/useStorefrontWishlist';
import { useStorefrontAuth } from '@/storefront/auth/useStorefrontAuth';
import { formatPrice } from '@/lib/format';

const statusColor: Record<string, string> = {
  placed: 'bg-info-muted text-info', confirmed: 'bg-info-muted text-info',
  packed: 'bg-warning-muted text-warning', shipped: 'bg-warning-muted text-warning',
  delivered: 'bg-success-muted text-success', cancelled: 'bg-destructive-muted text-destructive',
};

const AccountOverviewPage: React.FC = () => {
  const { customer } = useStorefrontAuth();
  const { orders } = useStorefrontOrders();
  const { wishlist } = useStorefrontWishlist();
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
          Welcome back, {customer?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your orders, wishlist, and profile</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Orders', value: orders.length, icon: Package, to: '/account/orders', color: 'text-primary' },
          { label: 'Wishlist', value: wishlist.length, icon: Heart, to: '/account/wishlist', color: 'text-[hsl(var(--sf-red))]' },
          { label: 'Shop Now', value: '', icon: ShoppingBag, to: '/store', color: 'text-success' },
        ].map(s => (
          <Link key={s.label} to={s.to}
            className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow group">
            <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
            {s.value !== '' && <p className="text-2xl font-black text-foreground">{s.value}</p>}
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground mt-1 flex items-center gap-1">
              {s.label} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black uppercase tracking-tight text-foreground">Recent Orders</h2>
          <Link to="/account/orders" className="text-xs font-bold text-primary uppercase tracking-[0.1em] hover:underline">View All</Link>
        </div>
        <div className="flex flex-col gap-3">
          {recentOrders.map(o => (
            <Link key={o.id} to={`/account/orders/${o.id}`}
              className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div>
                <p className="text-sm font-bold text-foreground">{o.order_number}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.items.length} item{o.items.length > 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ${statusColor[o.status] || 'bg-muted text-muted-foreground'}`}>{o.status}</span>
                <span className="text-sm font-bold text-foreground">{formatPrice(o.total_paisa)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountOverviewPage;
