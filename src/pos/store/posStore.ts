import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import cartReducer from './cartSlice';

export const posStore = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

export type POSRootState = ReturnType<typeof posStore.getState>;
export type POSDispatch = typeof posStore.dispatch;
export const usePOSDispatch: () => POSDispatch = useDispatch;
export const usePOSSelector: TypedUseSelectorHook<POSRootState> = useSelector;
