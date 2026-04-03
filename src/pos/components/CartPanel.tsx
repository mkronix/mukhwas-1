import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { usePOSDispatch, usePOSSelector } from "@/pos/store/posStore";
import {
  updateQuantity,
  removeItem,
  setLineDiscount,
  setCustomer,
  setOrderDiscount,
  setPayments,
  setCashTendered,
  clearCart,
  type POSCartItem,
  type POSCartCustomer,
  type POSOrderDiscount,
  type POSPaymentEntry,
} from "@/pos/store/cartSlice";
import { posCustomers } from "@/pos/mock";
import { formatINR } from "@/lib/format";
import {
  Minus,
  Plus,
  Trash2,
  Search,
  X,
  Percent,
  User,
  ShoppingCart,
  UserPlus,
  Tag,
} from "lucide-react";
import type { PaymentMode } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Toggle } from "@/components/ui/toggle";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { toast } from "sonner";

interface CartPanelProps {
  className?: string;
  onCharge: () => void;
}

const paymentShortcuts: Record<string, string> = {
  cash: "F1",
  upi: "F2",
  card: "F3",
};

const paymentModes: { mode: PaymentMode; label: string }[] = [
  { mode: "cash", label: "Cash" },
  { mode: "upi", label: "UPI" },
  { mode: "card", label: "Card" },
];

type DiscountType = "percentage" | "flat";

export const CartPanel: React.FC<CartPanelProps> = ({
  className,
  onCharge,
}) => {
  const dispatch = usePOSDispatch();
  const { items, customer, orderDiscount, payments, cashTendered } =
    usePOSSelector((s) => s.cart);

  const [lineDiscountItem, setLineDiscountItem] = useState<POSCartItem | null>(null);
  const [lineDiscType, setLineDiscType] = useState<DiscountType>("percentage");
  const [lineDiscValue, setLineDiscValue] = useState("");
  const [lineDiscError, setLineDiscError] = useState<string | undefined>();

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustErrors, setNewCustErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  }>({});

  const [showOrderDiscountModal, setShowOrderDiscountModal] = useState(false);
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [orderDiscValueError, setOrderDiscValueError] = useState<string | undefined>();
  const [orderDiscReasonError, setOrderDiscReasonError] = useState<string | undefined>();

  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>({});

  const lineDiscValueRef = useRef<HTMLInputElement>(null);
  const customerSearchRef = useRef<HTMLInputElement>(null);
  const orderDiscValueRef = useRef<HTMLInputElement>(null);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unit_price_paisa * i.quantity, 0),
    [items],
  );
  const lineDiscounts = useMemo(
    () => items.reduce((sum, i) => sum + i.discount_paisa, 0),
    [items],
  );

  const orderDiscountAmount = useMemo(() => {
    if (!orderDiscount) return 0;
    const base = subtotal - lineDiscounts;
    return orderDiscount.type === "percentage"
      ? Math.round((base * orderDiscount.value) / 100)
      : orderDiscount.value;
  }, [orderDiscount, subtotal, lineDiscounts]);

  const gstRate = 12;
  const afterDiscount = subtotal - lineDiscounts - orderDiscountAmount;
  const gstAmount = Math.round((afterDiscount * gstRate) / (100 + gstRate));
  const total = afterDiscount;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const selectedModes = payments.map((p) => p.mode);
  const isSplit = payments.length > 1;
  const paidTotal = payments.reduce((s, p) => s + p.amount_paisa, 0);
  const remaining = total - paidTotal;
  const changeDue =
    payments.length === 1 && payments[0]?.mode === "cash"
      ? Math.max(0, cashTendered - total)
      : 0;
  const isPaymentValid =
    items.length > 0 &&
    payments.length > 0 &&
    (isSplit ? paidTotal >= total : true);

  const togglePaymentMode = (mode: PaymentMode) => {
    if (selectedModes.includes(mode)) {
      const updated = payments.filter((p) => p.mode !== mode);
      dispatch(setPayments(updated));
      setSplitAmounts((prev) => {
        const next = { ...prev };
        delete next[mode];
        return next;
      });
    } else {
      const updated: POSPaymentEntry[] = [
        ...payments,
        { mode, amount_paisa: 0 },
      ];
      if (updated.length === 1) {
        updated[0].amount_paisa = total;
        if (mode === "cash") dispatch(setCashTendered(total));
        setSplitAmounts({ [mode]: (total / 100).toFixed(2) });
      } else {
        setSplitAmounts((prev) => ({ ...prev, [mode]: "" }));
      }
      dispatch(setPayments(updated));
    }
  };

  const handleSplitAmountChange = (mode: PaymentMode, raw: string) => {
    setSplitAmounts((prev) => ({ ...prev, [mode]: raw }));
    const parsed = parseFloat(raw);
    const amountPaisa = isNaN(parsed) ? 0 : Math.round(parsed * 100);
    dispatch(
      setPayments(
        payments.map((p) =>
          p.mode === mode ? { ...p, amount_paisa: amountPaisa } : p,
        ),
      ),
    );
  };

  const autoFillLast = () => {
    if (payments.length < 2) return;
    const allButLast = payments.slice(0, -1);
    const paid = allButLast.reduce((s, p) => s + p.amount_paisa, 0);
    const lastMode = payments[payments.length - 1].mode;
    const lastAmount = Math.max(0, total - paid);
    dispatch(
      setPayments([
        ...allButLast,
        { ...payments[payments.length - 1], amount_paisa: lastAmount },
      ]),
    );
    setSplitAmounts((prev) => ({ ...prev, [lastMode]: (lastAmount / 100).toFixed(2) }));
  };

  const applyOrderDiscount = () => {
    const val = parseFloat(discountValue);
    if (!val || val <= 0) {
      setOrderDiscValueError("Enter a positive discount");
      return;
    }
    if (!discountReason.trim()) {
      setOrderDiscReasonError("Reason is required");
      return;
    }
    setOrderDiscValueError(undefined);
    setOrderDiscReasonError(undefined);
    dispatch(
      setOrderDiscount({
        type: discountType,
        value: discountType === "flat" ? Math.round(val * 100) : val,
        reason: discountReason,
      }),
    );
    setShowOrderDiscountModal(false);
    setDiscountValue("");
    setDiscountReason("");
  };

  const applyLineDiscount = () => {
    if (!lineDiscountItem) return;
    const val = parseFloat(lineDiscValue);
    if (!val || val <= 0) {
      setLineDiscError("Enter a positive value");
      return;
    }
    setLineDiscError(undefined);
    dispatch(
      setLineDiscount({
        variant_id: lineDiscountItem.variant_id,
        type: lineDiscType,
        value: lineDiscType === "flat" ? Math.round(val * 100) : val,
      }),
    );
    setLineDiscountItem(null);
    setLineDiscValue("");
  };

  const removeLineDiscount = (variantId: string) => {
    dispatch(setLineDiscount({ variant_id: variantId, type: "flat", value: 0 }));
  };

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return posCustomers.slice(0, 5);
    const q = customerSearch.toLowerCase();
    return posCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email?.toLowerCase().includes(q),
    );
  }, [customerSearch]);

  const handleCreateCustomer = () => {
    const err: typeof newCustErrors = {};
    if (!newCustName.trim()) err.name = "Name is required";
    if (!newCustPhone.trim()) err.phone = "Phone is required";
    if (newCustEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustEmail.trim()))
      err.email = "Invalid email";
    if (Object.keys(err).length) {
      setNewCustErrors(err);
      return;
    }
    setNewCustErrors({});
    const newCustomer: POSCartCustomer = {
      id: `cust_pos_${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: newCustEmail.trim() || undefined,
    };
    dispatch(setCustomer(newCustomer));
    setShowCreateCustomer(false);
    setShowCustomerModal(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewCustEmail("");
    toast.success(`Customer ${newCustomer.name} created and attached`);
  };

  return (
    <div
      className={`flex flex-col h-full border-l border-border bg-card ${className || ""}`}
    >
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-foreground" />
          <span className="text-sm font-semibold text-foreground">Cart</span>
          {totalItems > 0 && (
            <Badge className="text-[10px] h-5 min-w-5 px-1.5">
              {totalItems}
            </Badge>
          )}
        </div>
        {items.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-destructive hover:text-destructive h-auto p-0"
                title="Clear all items from cart"
              >
                Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear cart?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all items from the cart.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => dispatch(clearCart())}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <ShoppingCart className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">Cart is empty</p>
            <p className="text-xs mt-1">Tap a product to add</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.variant_id} className="px-3 py-2.5 flex gap-2.5">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt=""
                    className="h-10 w-10 rounded-md object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.variant_name} · {formatINR(item.unit_price_paisa)}
                  </p>
                  {item.discount_paisa > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="text-[10px] text-success">
                        -{formatINR(item.discount_paisa)} discount
                      </p>
                      <button
                        onClick={() => removeLineDiscount(item.variant_id)}
                        title="Remove line discount"
                        className="text-destructive/60 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-1.5">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 rounded-md"
                      title="Decrease quantity"
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            variant_id: item.variant_id,
                            quantity: item.quantity - 1,
                          }),
                        )
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-6 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 rounded-md"
                      title="Increase quantity"
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            variant_id: item.variant_id,
                            quantity: item.quantity + 1,
                          }),
                        )
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 rounded-md ml-1"
                      title="Apply line discount"
                      onClick={() => {
                        setLineDiscError(undefined);
                        setLineDiscountItem(item);
                        setLineDiscType(item.discount_type || "percentage");
                        setLineDiscValue(item.discount_value ? String(item.discount_value) : "");
                      }}
                    >
                      <Percent className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 ml-auto text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                      title="Remove item"
                      onClick={() => dispatch(removeItem(item.variant_id))}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-card-foreground shrink-0">
                  {formatINR(
                    item.unit_price_paisa * item.quantity - item.discount_paisa,
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-border px-3 py-2">
        {customer ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">
                {customer.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {customer.phone}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-destructive hover:text-destructive h-auto p-0"
              title="Remove customer"
              onClick={() => dispatch(setCustomer(null))}
            >
              Remove
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary h-auto p-0 gap-1"
            title="Attach a customer to this order"
            onClick={() => setShowCustomerModal(true)}
          >
            <User className="h-3 w-3" /> Add Customer
          </Button>
        )}
      </div>

      <div className="border-t border-border px-3 py-2 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">{formatINR(subtotal)}</span>
        </div>
        {lineDiscounts > 0 && (
          <div className="flex justify-between text-success">
            <span>Line Discounts</span>
            <span>-{formatINR(lineDiscounts)}</span>
          </div>
        )}
        {orderDiscountAmount > 0 && (
          <div className="flex justify-between items-center text-success">
            <span>Order Discount</span>
            <div className="flex items-center gap-1">
              <span>-{formatINR(orderDiscountAmount)}</span>
              <button
                onClick={() => dispatch(setOrderDiscount(null))}
                title="Remove order discount"
                className="text-destructive/60 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>GST (incl. {gstRate}%)</span>
          <span>{formatINR(gstAmount)}</span>
        </div>
        <Separator className="my-1" />
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span className="text-primary">{formatINR(total)}</span>
        </div>
        {!orderDiscount && items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] text-primary h-auto p-0 gap-1"
            title="Apply an order-level discount"
            onClick={() => setShowOrderDiscountModal(true)}
          >
            <Tag className="h-3 w-3" /> Add order discount
          </Button>
        )}
      </div>

      <div className="border-t border-border px-3 py-2.5 space-y-2">
        <div className="grid grid-cols-3 gap-1.5">
          {paymentModes.map((pm) => (
            <Toggle
              key={pm.mode}
              pressed={selectedModes.includes(pm.mode)}
              onPressedChange={() => togglePaymentMode(pm.mode)}
              title={`${pm.label} (${paymentShortcuts[pm.mode]})`}
              className="h-10 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {pm.label}
            </Toggle>
          ))}
        </div>

        {isSplit && (
          <div className="space-y-1.5">
            {payments.map((p) => (
              <div key={p.mode} className="flex items-center gap-2">
                <span className="text-xs font-medium w-10 capitalize">
                  {p.mode}
                </span>
                <Input
                  type="number"
                  value={splitAmounts[p.mode] ?? ""}
                  onChange={(e) => handleSplitAmountChange(p.mode, e.target.value)}
                  className="h-7 text-xs px-2 text-right"
                  placeholder="0.00"
                />
              </div>
            ))}
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Remaining</span>
              <span
                className={remaining > 0 ? "text-destructive" : "text-success"}
              >
                {formatINR(Math.abs(remaining))}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] text-primary h-auto p-0"
              title="Auto-fill remaining balance into last payment method"
              onClick={autoFillLast}
            >
              Auto-fill last
            </Button>
          </div>
        )}

        {payments.length === 1 && payments[0]?.mode === "cash" && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-16">
                Tendered
              </span>
              <Input
                type="number"
                value={cashTendered ? (cashTendered / 100).toFixed(2) : ""}
                onChange={(e) =>
                  dispatch(
                    setCashTendered(
                      Math.round(parseFloat(e.target.value || "0") * 100),
                    ),
                  )
                }
                className="h-7 text-xs px-2 text-right"
              />
            </div>
            {changeDue > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Change</span>
                <span className="text-success font-semibold">
                  {formatINR(changeDue)}
                </span>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={onCharge}
          disabled={!isPaymentValid}
          className="w-full h-12 rounded-xl font-semibold text-sm"
          title="Charge – Complete sale (Enter)"
        >
          {items.length === 0
            ? "Add items to cart"
            : `Charge ${formatINR(total)}`}
        </Button>
      </div>

      <ResponsiveModal
        open={!!lineDiscountItem}
        onOpenChange={(v) => { if (!v) { setLineDiscountItem(null); setLineDiscValue(""); setLineDiscError(undefined); } }}
        title={`Discount: ${lineDiscountItem?.product_name ?? ""}`}
        description={lineDiscountItem ? `${lineDiscountItem.variant_name} · ${formatINR(lineDiscountItem.unit_price_paisa)}` : undefined}
        className="sm:max-w-[400px]"
      >
        <div className="space-y-4 p-1">
          <ModalFormField label="Discount" error={lineDiscError} description={lineDiscType === "percentage" ? "Percent off this line" : "Amount off in ₹"}>
            {(id) => (
              <div className="flex gap-2">
                <Select value={lineDiscType} onValueChange={(v) => { setLineDiscType(v as DiscountType); setLineDiscError(undefined); }}>
                  <SelectTrigger className="w-20" id={`${id}-type`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="flat">₹</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  ref={lineDiscValueRef}
                  id={id}
                  type="number"
                  step="any"
                  value={lineDiscValue}
                  onChange={(e) => { setLineDiscValue(e.target.value); if (lineDiscError) setLineDiscError(undefined); }}
                  placeholder={lineDiscType === "percentage" ? "10" : "50"}
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") applyLineDiscount(); }}
                />
              </div>
            )}
          </ModalFormField>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setLineDiscountItem(null); setLineDiscValue(""); setLineDiscError(undefined); }}>Cancel</Button>
            <Button onClick={applyLineDiscount}>Apply</Button>
          </div>
        </div>
      </ResponsiveModal>

      <ResponsiveModal
        open={showCustomerModal}
        onOpenChange={(v) => { if (!v) { setShowCustomerModal(false); setCustomerSearch(""); } }}
        title="Select Customer"
        className="sm:max-w-[450px]"
      >
        <div className="space-y-3 p-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            title="Create a new customer"
            onClick={() => setShowCreateCustomer(true)}
          >
            <UserPlus className="h-3.5 w-3.5" /> New Customer
          </Button>
          <ModalFormField label="Search" description="Name, phone, or email">
            {(id) => (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={customerSearchRef}
                  id={id}
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Start typing…"
                  className="pl-9"
                  autoFocus
                />
              </div>
            )}
          </ModalFormField>
          <ScrollArea className="max-h-52">
            <div className="space-y-0.5">
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    dispatch(
                      setCustomer({
                        id: c.id,
                        name: c.name,
                        phone: c.phone,
                        email: c.email,
                      }),
                    );
                    setShowCustomerModal(false);
                    setCustomerSearch("");
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition-colors"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground ml-2">{c.phone}</span>
                </button>
              ))}
              {filteredCustomers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No customers found</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </ResponsiveModal>

      <ResponsiveModal
        open={showCreateCustomer}
        onOpenChange={(v) => { if (!v) { setShowCreateCustomer(false); setNewCustErrors({}); } }}
        title="New Customer"
        description="Create a POS customer"
        className="sm:max-w-[400px]"
      >
        <div className="space-y-4 p-1">
          <ModalFormField label="Full name" error={newCustErrors.name}>
            {(id) => (
              <Input
                id={id}
                value={newCustName}
                onChange={(e) => { setNewCustName(e.target.value); if (newCustErrors.name) setNewCustErrors((p) => ({ ...p, name: undefined })); }}
                placeholder="Customer name"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateCustomer(); }}
              />
            )}
          </ModalFormField>
          <ModalFormField label="Phone" error={newCustErrors.phone}>
            {(id) => (
              <Input
                id={id}
                value={newCustPhone}
                onChange={(e) => { setNewCustPhone(e.target.value); if (newCustErrors.phone) setNewCustErrors((p) => ({ ...p, phone: undefined })); }}
                placeholder="10-digit mobile"
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateCustomer(); }}
              />
            )}
          </ModalFormField>
          <ModalFormField label="Email" error={newCustErrors.email} description="Optional">
            {(id) => (
              <Input
                id={id}
                type="email"
                value={newCustEmail}
                onChange={(e) => { setNewCustEmail(e.target.value); if (newCustErrors.email) setNewCustErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="name@email.com"
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateCustomer(); }}
              />
            )}
          </ModalFormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setShowCreateCustomer(false); setNewCustErrors({}); }}>Cancel</Button>
            <Button onClick={handleCreateCustomer}>Create & Select</Button>
          </div>
        </div>
      </ResponsiveModal>

      <ResponsiveModal
        open={showOrderDiscountModal}
        onOpenChange={(v) => { if (!v) { setShowOrderDiscountModal(false); setDiscountValue(""); setDiscountReason(""); setOrderDiscValueError(undefined); setOrderDiscReasonError(undefined); } }}
        title="Order Discount"
        description={`Subtotal: ${formatINR(subtotal - lineDiscounts)}`}
        className="sm:max-w-[420px]"
      >
        <div className="space-y-4 p-1">
          <ModalFormField label="Discount" error={orderDiscValueError} description={discountType === "percentage" ? "Percent off order" : "Amount off in ₹"}>
            {(id) => (
              <div className="flex gap-2">
                <Select value={discountType} onValueChange={(v) => { setDiscountType(v as DiscountType); setOrderDiscValueError(undefined); }}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="flat">₹</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  ref={orderDiscValueRef}
                  id={id}
                  type="number"
                  step="any"
                  value={discountValue}
                  onChange={(e) => { setDiscountValue(e.target.value); if (orderDiscValueError) setOrderDiscValueError(undefined); }}
                  placeholder={discountType === "percentage" ? "5" : "100"}
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") applyOrderDiscount(); }}
                />
              </div>
            )}
          </ModalFormField>
          <ModalFormField label="Reason" error={orderDiscReasonError}>
            {(id) => (
              <Input
                id={id}
                value={discountReason}
                onChange={(e) => { setDiscountReason(e.target.value); if (orderDiscReasonError) setOrderDiscReasonError(undefined); }}
                placeholder="Loyalty, manager approval…"
                onKeyDown={(e) => { if (e.key === "Enter") applyOrderDiscount(); }}
              />
            )}
          </ModalFormField>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowOrderDiscountModal(false); setDiscountValue(""); setDiscountReason(""); setOrderDiscValueError(undefined); setOrderDiscReasonError(undefined); }}>Cancel</Button>
            <Button onClick={applyOrderDiscount}>Apply</Button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
};