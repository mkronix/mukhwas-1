import React, { useState, useCallback, useMemo, useRef } from 'react';
import { ProductBrowser } from '@/pos/components/ProductBrowser';
import { CartPanel } from '@/pos/components/CartPanel';
import { TransactionSuccess } from '@/pos/components/TransactionSuccess';
import { ReceiptView } from '@/pos/components/ReceiptView';
import { EndSessionModal } from '@/pos/components/EndSessionModal';
import { ShortcutHelpOverlay } from '@/pos/components/ShortcutHelpOverlay';
import { MultiplierBadge } from '@/pos/components/MultiplierBadge';
import { usePOSDispatch, usePOSSelector } from '@/pos/store/posStore';
import { clearCart, removeItem, updateQuantity, setPayments, setCashTendered } from '@/pos/store/cartSlice';
import { usePOSAuth } from '@/pos/auth/usePOSAuth';
import { useKeyboardShortcuts } from '@/pos/hooks/useKeyboardShortcuts';
import { generateTransactionId, generateReceiptNumber } from '@/pos/lib/utils';
import { formatINR } from '@/lib/format';
import { ShoppingCart, LayoutGrid, LogOut, PanelLeftOpen } from 'lucide-react';
import { POSTerminalNavSheet } from '@/pos/components/POSTerminalNavSheet';
import { useNavigate } from 'react-router-dom';
import type { PaymentMode } from '@/types';

export const POSTerminalPage: React.FC = () => {
  const dispatch = usePOSDispatch();
  const { staff, logout } = usePOSAuth();
  const navigate = useNavigate();
  const cart = usePOSSelector(s => s.cart);
  const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showEndSession, setShowEndSession] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [navSheetOpen, setNavSheetOpen] = useState(false);
  const [lastTxn, setLastTxn] = useState<{ orderId: string; total: number; changeDue: number; receiptNumber: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);

  const subtotal = useMemo(() => cart.items.reduce((s, i) => s + i.unit_price_paisa * i.quantity, 0), [cart.items]);
  const lineDiscounts = useMemo(() => cart.items.reduce((s, i) => s + i.discount_paisa, 0), [cart.items]);
  const orderDiscountAmount = useMemo(() => {
    if (!cart.orderDiscount) return 0;
    const base = subtotal - lineDiscounts;
    return cart.orderDiscount.type === 'percentage' ? Math.round(base * cart.orderDiscount.value / 100) : cart.orderDiscount.value;
  }, [cart.orderDiscount, subtotal, lineDiscounts]);
  const afterDiscount = subtotal - lineDiscounts - orderDiscountAmount;
  const gstRate = 12;
  const gstAmount = Math.round(afterDiscount * gstRate / (100 + gstRate));
  const total = afterDiscount;
  const changeDue = cart.payments.length === 1 && cart.payments[0]?.mode === 'cash' ? Math.max(0, cart.cashTendered - total) : 0;
  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);

  const payments = cart.payments;
  const selectedModes = payments.map(p => p.mode);
  const isSplit = payments.length > 1;
  const paidTotal = payments.reduce((s, p) => s + p.amount_paisa, 0);
  const isPaymentValid = cart.items.length > 0 && payments.length > 0 && (isSplit ? paidTotal >= total : true);

  const handleCharge = useCallback(async () => {
    if (!isPaymentValid) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 300));
    const orderId = generateTransactionId();
    const receiptNumber = generateReceiptNumber();
    setLastTxn({ orderId, total, changeDue, receiptNumber });
    setShowSuccess(true);
    setProcessing(false);
  }, [total, changeDue, isPaymentValid]);

  const handleNewSale = useCallback(() => {
    dispatch(clearCart());
    setShowSuccess(false);
    setLastTxn(null);
    setMobileTab('products');
  }, [dispatch]);

  const handlePrintReceipt = useCallback(() => {
    setShowSuccess(false);
    setShowReceipt(true);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleEndSession = useCallback((actualCash: number, notes: string) => {
    setShowEndSession(false);
    logout();
    navigate('/pos/login');
  }, [logout, navigate]);

  const togglePaymentMode = useCallback((mode: PaymentMode) => {
    if (selectedModes.includes(mode)) {
      dispatch(setPayments(payments.filter(p => p.mode !== mode)));
    } else {
      const newPayment = { mode, amount_paisa: 0 };
      const updated = [...payments, newPayment];
      if (updated.length === 1) {
        updated[0].amount_paisa = total;
        if (mode === 'cash') dispatch(setCashTendered(total));
      }
      dispatch(setPayments(updated));
    }
  }, [dispatch, payments, selectedModes, total]);

  const handleProductAdded = useCallback(() => {
    setMultiplier(1);
  }, []);

  // Listen for help toggle from layout header button
  React.useEffect(() => {
    const handler = () => setShowHelp(prev => !prev);
    window.addEventListener('pos:toggle-help', handler);
    return () => window.removeEventListener('pos:toggle-help', handler);
  }, []);

  const hasOpenModal =
    showSuccess || showReceipt || showEndSession || showHelp || navSheetOpen;

  useKeyboardShortcuts({
    onCharge: handleCharge,
    onTogglePayment: togglePaymentMode,
    onSetMultiplier: setMultiplier,
    onClearMultiplier: useCallback(() => setMultiplier(1), []),
    onRemoveLastItem: useCallback(() => {
      if (cart.items.length > 0) {
        const lastItem = cart.items[cart.items.length - 1];
        dispatch(removeItem(lastItem.variant_id));
      }
    }, [cart.items, dispatch]),
    onShowHelp: useCallback(() => setShowHelp(prev => !prev), []),
    onCloseModal: useCallback(() => {
      if (showHelp) setShowHelp(false);
      else if (showEndSession) setShowEndSession(false);
    }, [showHelp, showEndSession]),
    onFocusSearch: useCallback(() => searchRef.current?.focus(), []),
    isPaymentValid,
    hasOpenModal,
    hasMultiplier: multiplier > 1,
  });

  return (
    <div className="h-full flex flex-col relative">
      <button
        type="button"
        onClick={() => setNavSheetOpen(true)}
        className="absolute top-2 left-2 z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm hover:bg-muted/60 transition-colors"
        title="Open navigation"
        aria-label="Open navigation menu"
      >
        <PanelLeftOpen className="h-5 w-5" />
      </button>
      <POSTerminalNavSheet open={navSheetOpen} onOpenChange={setNavSheetOpen} />

      {processing && (
        <div className="absolute inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Processing...</p>
          </div>
        </div>
      )}

      {/* Desktop: two-column */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <ProductBrowser className="w-[60%]" multiplier={multiplier} onProductAdded={handleProductAdded} searchRef={searchRef} />
        <CartPanel className="w-[40%]" onCharge={handleCharge} />
      </div>

      {/* Mobile: tabs */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'products' ? (
            <ProductBrowser className="h-full" multiplier={multiplier} onProductAdded={handleProductAdded} searchRef={searchRef} />
          ) : (
            <CartPanel className="h-full" onCharge={handleCharge} />
          )}
        </div>
        <div className="h-14 border-t border-border bg-card flex shrink-0">
          <button onClick={() => setMobileTab('products')} title="Browse products"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${mobileTab === 'products' ? 'text-primary' : 'text-muted-foreground'}`}>
            <LayoutGrid className="h-5 w-5" /> Products
          </button>
          <button onClick={() => setMobileTab('cart')} title="View cart"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors relative ${mobileTab === 'cart' ? 'text-primary' : 'text-muted-foreground'}`}>
            <ShoppingCart className="h-5 w-5" />
            Cart
            {totalItems > 0 && (
              <span className="absolute top-1.5 right-1/4 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary text-primary-foreground min-w-[16px] text-center">{totalItems}</span>
            )}
          </button>
          <button onClick={() => setShowEndSession(true)} title="End session"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground">
            <LogOut className="h-5 w-5" /> End
          </button>
        </div>
      </div>

      {/* End Session button (desktop - in header area) */}
      <button onClick={() => setShowEndSession(true)} title="End session"
        className="hidden md:flex absolute top-0 right-0 -mt-12 mr-3 items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
        <LogOut className="h-3.5 w-3.5" /> End Session
      </button>

      {/* Multiplier badge in header area */}
      <div className="absolute top-0 right-0 -mt-12 mr-36 hidden md:flex items-center">
        <MultiplierBadge multiplier={multiplier} />
      </div>

      {showHelp && <ShortcutHelpOverlay onClose={() => setShowHelp(false)} />}

      {showSuccess && lastTxn && (
        <TransactionSuccess
          orderId={lastTxn.orderId}
          total={lastTxn.total}
          changeDue={lastTxn.changeDue}
          payments={cart.payments}
          customerName={cart.customer?.name}
          onNewSale={handleNewSale}
          onPrintReceipt={handlePrintReceipt}
        />
      )}

      {showReceipt && lastTxn && (
        <ReceiptView
          receiptNumber={lastTxn.receiptNumber}
          orderId={lastTxn.orderId}
          cashierName={staff?.name || 'Staff'}
          customerName={cart.customer?.name || 'Walk-in Customer'}
          items={cart.items}
          subtotal={subtotal}
          orderDiscount={cart.orderDiscount}
          orderDiscountAmount={orderDiscountAmount}
          lineDiscounts={lineDiscounts}
          gstRate={gstRate}
          gstAmount={gstAmount}
          total={total}
          payments={cart.payments}
          changeDue={changeDue}
          timestamp={new Date()}
          onPrint={handlePrint}
          onClose={() => { setShowReceipt(false); handleNewSale(); }}
        />
      )}

      {showEndSession && (
        <EndSessionModal onClose={() => setShowEndSession(false)} onConfirm={handleEndSession} />
      )}
    </div>
  );
};
