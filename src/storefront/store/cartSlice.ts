import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantName: string;
  imageUrl: string;
  pricePaisa: number;
  quantity: number;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  drawerOpen: boolean;
}

const STORAGE_KEY = 'sf_cart';

const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const persist = (items: CartItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const initialState: CartState = {
  items: loadCart(),
  drawerOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(i => i.variantId === action.payload.variantId);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + action.payload.quantity, existing.maxStock);
      } else {
        state.items.push({ ...action.payload });
      }
      persist(state.items);
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.variantId !== action.payload);
      persist(state.items);
    },
    updateQuantity(state, action: PayloadAction<{ variantId: string; quantity: number }>) {
      const item = state.items.find(i => i.variantId === action.payload.variantId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(i => i.variantId !== action.payload.variantId);
        } else {
          item.quantity = Math.min(action.payload.quantity, item.maxStock);
        }
      }
      persist(state.items);
    },
    clearCart(state) {
      state.items = [];
      persist(state.items);
    },
    openDrawer(state) { state.drawerOpen = true; },
    closeDrawer(state) { state.drawerOpen = false; },
    toggleDrawer(state) { state.drawerOpen = !state.drawerOpen; },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, openDrawer, closeDrawer, toggleDrawer } = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) => state.cart.items.reduce((s, i) => s + i.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) => state.cart.items.reduce((s, i) => s + i.pricePaisa * i.quantity, 0);
export const selectCartDrawerOpen = (state: { cart: CartState }) => state.cart.drawerOpen;

export default cartSlice.reducer;
