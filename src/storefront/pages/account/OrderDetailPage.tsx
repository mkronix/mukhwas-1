import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useStorefrontOrder } from '@/storefront/hooks/useStorefrontOrders';
import { formatPrice } from '@/lib/format';

const orderSteps = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];

const AccountOrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const { order, loading } = useStorefrontOrder(id);

  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading...</div>;
  if (!order) return <div className="py-16 text-center"><p className="text-foreground font-bold">Order not found</p><Link to="/account/orders" className="text-primary hover:underline text-sm">Back to orders</Link></div>;

  const currentStepIndex = order.status === 'cancelled' ? -1 : orderSteps.indexOf(order.status);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link to="/account/orders" className="p-2 rounded-lg hover:bg-secondary transition-colors"><ArrowLeft className="w-5 h-5 text-foreground" /></Link>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-foreground">{order.order_number}</h1>
          <p className="text-xs text-muted-foreground">Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {order.status !== 'cancelled' && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground mb-6">Order Timeline</h3>
          <div className="flex items-center gap-0">
            {orderSteps.map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= currentStepIndex ? 'bg-success text-white' : 'bg-secondary text-muted-foreground'}`}>
                    {i <= currentStepIndex ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground capitalize">{step}</span>
                </div>
                {i < orderSteps.length - 1 && <div className={`flex-1 h-0.5 mb-6 ${i < currentStepIndex ? 'bg-success' : 'bg-border'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground mb-4">Items</h3>
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between py-3 border-b border-border last:border-0 text-sm">
            <div>
              <p className="font-bold text-foreground">{item.product_name}</p>
              <p className="text-xs text-muted-foreground">{item.variant_name} × {item.quantity}</p>
            </div>
            <span className="font-bold text-foreground">{formatPrice(item.total_paisa)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-4 text-base font-black"><span>Total</span><span>{formatPrice(order.total_paisa)}</span></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground mb-2">Delivery Address</h3>
          <p className="text-sm text-foreground">{order.shipping_address.line1}{order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ''}</p>
          <p className="text-sm text-muted-foreground">{order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground mb-2">Payment</h3>
          <p className="text-sm text-foreground capitalize">{order.payment_mode?.replace('_', ' ') || 'N/A'}</p>
          <p className="text-xs text-muted-foreground capitalize mt-0.5">Status: {order.payment_status}</p>
        </div>
      </div>
    </div>
  );
};

export default AccountOrderDetailPage;
