import React from 'react';
import { posConfig } from '@/pos/mock';
import { formatINR } from '@/lib/format';
import type { POSCartItem, POSPaymentEntry, POSOrderDiscount } from '@/pos/store/cartSlice';

interface ReceiptViewProps {
  receiptNumber: string;
  orderId: string;
  cashierName: string;
  customerName: string;
  items: POSCartItem[];
  subtotal: number;
  orderDiscount: POSOrderDiscount | null;
  orderDiscountAmount: number;
  lineDiscounts: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  payments: POSPaymentEntry[];
  changeDue: number;
  timestamp: Date;
  onPrint: () => void;
  onClose: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  receiptNumber, orderId, cashierName, customerName, items,
  subtotal, orderDiscount, orderDiscountAmount, lineDiscounts,
  gstRate, gstAmount, total, payments, changeDue, timestamp,
  onPrint, onClose,
}) => {
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;
  const dateStr = timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div id="receipt-content" className="font-mono text-xs space-y-3">
            <div className="text-center space-y-0.5">
              {posConfig.receipt_header.split('\n').map((line, i) => (
                <p key={i} className={i === 0 ? 'font-bold text-sm text-foreground' : 'text-muted-foreground'}>{line}</p>
              ))}
              <p className="text-muted-foreground">{posConfig.brand_phone}</p>
              <p className="text-muted-foreground">GSTIN: {posConfig.brand_gstin}</p>
            </div>

            <div className="border-t border-dashed border-border" />

            <div className="flex justify-between text-muted-foreground">
              <span>Receipt: {receiptNumber}</span>
              <span>{dateStr}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Order: {orderId}</span>
              <span>{timeStr}</span>
            </div>
            <p className="text-muted-foreground">Cashier: {cashierName}</p>
            <p className="text-muted-foreground">Customer: {customerName}</p>

            <div className="border-t border-dashed border-border" />

            <table className="w-full">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-dashed border-border">
                  <th className="pb-1">Item</th>
                  <th className="pb-1 text-right">Qty</th>
                  <th className="pb-1 text-right">Rate</th>
                  <th className="pb-1 text-right">Amt</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.variant_id} className="text-foreground">
                    <td className="py-0.5">
                      <p className="truncate max-w-[120px]">{item.product_name}</p>
                      <p className="text-muted-foreground text-[10px]">{item.variant_name}</p>
                    </td>
                    <td className="text-right py-0.5">{item.quantity}</td>
                    <td className="text-right py-0.5">{formatINR(item.unit_price_paisa)}</td>
                    <td className="text-right py-0.5">{formatINR(item.unit_price_paisa * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-border" />

            <div className="space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">{formatINR(subtotal)}</span></div>
              {lineDiscounts > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-foreground">-{formatINR(lineDiscounts)}</span></div>}
              {orderDiscountAmount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Order Discount</span><span className="text-foreground">-{formatINR(orderDiscountAmount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">CGST ({gstRate / 2}%)</span><span className="text-foreground">{formatINR(cgst)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SGST ({gstRate / 2}%)</span><span className="text-foreground">{formatINR(sgst)}</span></div>
              <div className="flex justify-between font-bold text-sm border-t border-dashed border-border pt-1">
                <span className="text-foreground">TOTAL</span>
                <span className="text-foreground">{formatINR(total)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-border" />

            <div className="space-y-0.5">
              {payments.map(p => (
                <div key={p.mode} className="flex justify-between text-muted-foreground capitalize">
                  <span>{p.mode}</span><span>{formatINR(p.amount_paisa)}</span>
                </div>
              ))}
              {changeDue > 0 && (
                <div className="flex justify-between font-medium"><span className="text-foreground">Change</span><span className="text-foreground">{formatINR(changeDue)}</span></div>
              )}
            </div>

            <div className="border-t border-dashed border-border" />

            <div className="text-center text-muted-foreground">
              {posConfig.receipt_footer.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">Close</button>
          <button onClick={onPrint} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Print</button>
        </div>
      </div>
    </div>
  );
};
