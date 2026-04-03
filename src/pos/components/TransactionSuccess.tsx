import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { formatINR } from '@/pos/mock';
import type { POSPaymentEntry } from '@/pos/store/cartSlice';

interface TransactionSuccessProps {
  orderId: string;
  total: number;
  changeDue: number;
  payments: POSPaymentEntry[];
  customerName?: string;
  onNewSale: () => void;
  onPrintReceipt: () => void;
}

export const TransactionSuccess: React.FC<TransactionSuccessProps> = ({
  orderId, total, changeDue, payments, customerName, onNewSale, onPrintReceipt,
}) => {
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { onNewSale(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onNewSale]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="flex flex-col items-center gap-5 max-w-sm w-full px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
          className="h-20 w-20 rounded-full bg-success flex items-center justify-center"
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Check className="h-10 w-10 text-success-foreground" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Payment Successful</h2>
          <p className="text-sm text-muted-foreground">Order {orderId}</p>
        </div>

        <div className="w-full bg-card rounded-xl border border-border p-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Charged</span>
            <span className="font-bold text-foreground">{formatINR(total)}</span>
          </div>
          {changeDue > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Change Due</span>
              <span className="font-bold text-success">{formatINR(changeDue)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <span className="text-foreground capitalize">{payments.map(p => p.mode).join(' + ')}</span>
          </div>
          {customerName && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer</span>
              <span className="text-foreground">{customerName}</span>
            </div>
          )}
        </div>

        <div className="w-full flex gap-3">
          <button onClick={onPrintReceipt}
            className="flex-1 h-12 rounded-xl border border-border bg-secondary text-secondary-foreground font-medium text-sm hover:bg-accent active:scale-[0.98] transition-all">
            Print Receipt
          </button>
          <button onClick={onNewSale}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition-all">
            New Sale
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Auto-advancing in {countdown}s
        </p>
      </motion.div>
    </motion.div>
  );
};
