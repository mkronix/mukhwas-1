import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ShoppingBag } from 'lucide-react';

const OrderConfirmationPage: React.FC = () => {
  const [params] = useSearchParams();
  const orderId = params.get('orderId') || 'MKW-2025-NEW';

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  return (
    <section className="bg-[hsl(var(--sf-cream))] min-h-[80vh] flex items-center justify-center py-16">
      <div className="max-w-md mx-auto px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring' }}>
            <CheckCircle2 className="w-10 h-10 text-success" />
          </motion.div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-3xl font-black uppercase tracking-tight text-foreground mb-3">
          Order Placed!
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-6 leading-relaxed">
          Thank you for your order. We're preparing your mukhwas with love!
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl border border-border p-6 mb-8 text-left">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-bold text-foreground">{orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Delivery</span>
              <span className="font-bold text-foreground">{deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3">
          <Link to="/account/orders"
            className="flex-1 h-12 rounded-xl bg-[hsl(var(--sf-red))] text-white font-black uppercase tracking-[0.1em] text-sm flex items-center justify-center gap-2 hover:bg-[hsl(var(--sf-brown))] transition-colors">
            <Package className="w-4 h-4" /> Track Order
          </Link>
          <Link to="/store"
            className="flex-1 h-12 rounded-xl border-2 border-border text-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-colors">
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default OrderConfirmationPage;
