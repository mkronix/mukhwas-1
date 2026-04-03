import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PaymentMode } from '@/types';

export interface POSCartItem {
  id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_name: string;
  image_url?: string;
  unit_price_paisa: number;
  quantity: number;
  discount_paisa: number;
  discount_type?: 'percentage' | 'flat';
  discount_value?: number;
}

export interface POSCartCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  total_orders?: number;
}

export interface POSPaymentEntry {
  mode: PaymentMode;
  amount_paisa: number;
}

export interface POSOrderDiscount {
  type: 'percentage' | 'flat';
  value: number;
  reason: string;
}

interface CartState {
  items: POSCartItem[];
  customer: POSCartCustomer | null;
  orderDiscount: POSOrderDiscount | null;
  payments: POSPaymentEntry[];
  cashTendered: number;
  notes: string;
}

function loadCart(): CartState {
  try {
    const stored = localStorage.getItem('pos_cart');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { items: [], customer: null, orderDiscount: null, payments: [], cashTendered: 0, notes: '' };
}

function saveCart(state: CartState) {
  localStorage.setItem('pos_cart', JSON.stringify(state));
}

const cartSlice = createSlice({
  name: 'posCart',
  initialState: loadCart(),
  reducers: {
    addItem(state, action: PayloadAction<Omit<POSCartItem, 'quantity' | 'discount_paisa' | 'id'> & { quantity?: number }>) {
      const qty = action.payload.quantity ?? 1;
      const { quantity: _q, ...rest } = action.payload;
      const existing = state.items.find(i => i.variant_id === rest.variant_id);
      if (existing) {
        existing.quantity += qty;
      } else {
        state.items.push({
          ...rest,
          id: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          quantity: qty,
          discount_paisa: 0,
        });
      }
      saveCart(state);
    },
    updateQuantity(state, action: PayloadAction<{ variant_id: string; quantity: number }>) {
      const item = state.items.find(i => i.variant_id === action.payload.variant_id);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(i => i.variant_id !== action.payload.variant_id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      saveCart(state);
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.variant_id !== action.payload);
      saveCart(state);
    },
    setLineDiscount(state, action: PayloadAction<{ variant_id: string; type: 'percentage' | 'flat'; value: number }>) {
      const item = state.items.find(i => i.variant_id === action.payload.variant_id);
      if (item) {
        item.discount_type = action.payload.type;
        item.discount_value = action.payload.value;
        if (action.payload.type === 'percentage') {
          item.discount_paisa = Math.round((item.unit_price_paisa * item.quantity * action.payload.value) / 100);
        } else {
          item.discount_paisa = action.payload.value;
        }
      }
      saveCart(state);
    },
    setCustomer(state, action: PayloadAction<POSCartCustomer | null>) {
      state.customer = action.payload;
      saveCart(state);
    },
    setOrderDiscount(state, action: PayloadAction<POSOrderDiscount | null>) {
      state.orderDiscount = action.payload;
      saveCart(state);
    },
    setPayments(state, action: PayloadAction<POSPaymentEntry[]>) {
      state.payments = action.payload;
      saveCart(state);
    },
    setCashTendered(state, action: PayloadAction<number>) {
      state.cashTendered = action.payload;
      saveCart(state);
    },
    setNotes(state, action: PayloadAction<string>) {
      state.notes = action.payload;
      saveCart(state);
    },
    clearCart(state) {
      state.items = [];
      state.customer = null;
      state.orderDiscount = null;
      state.payments = [];
      state.cashTendered = 0;
      state.notes = '';
      saveCart(state);
    },
  },
});

export const {
  addItem, updateQuantity, removeItem, setLineDiscount,
  setCustomer, setOrderDiscount, setPayments, setCashTendered,
  setNotes, clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
