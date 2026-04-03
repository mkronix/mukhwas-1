import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import cartReducer from './cartSlice';

export const storefrontStore = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

export type StorefrontRootState = ReturnType<typeof storefrontStore.getState>;
export type StorefrontDispatch = typeof storefrontStore.dispatch;
export const useStorefrontDispatch: () => StorefrontDispatch = useDispatch;
export const useStorefrontSelector: TypedUseSelectorHook<StorefrontRootState> = useSelector;
