import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

/** Minimal root reducer until admin slices are added; RTK rejects an empty combineReducers map. */
const rootReducer = (state: Record<string, never> | undefined = {}) => state;

export const adminStore = configureStore({
  reducer: rootReducer,
});

export type AdminRootState = ReturnType<typeof adminStore.getState>;
export type AdminDispatch = typeof adminStore.dispatch;
export const useAdminDispatch: () => AdminDispatch = useDispatch;
export const useAdminSelector: TypedUseSelectorHook<AdminRootState> = useSelector;
