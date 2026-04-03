import React, { createContext, useState, useCallback } from 'react';
import type { Customer } from '@/types';
import env from '@/config/env';
import { storefrontApiClient } from '@/lib/apiClient';

interface StorefrontAuthState {
  customer: Customer | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  isLoading: boolean;
}

interface StorefrontAuthContextValue extends StorefrontAuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; phone: string }) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const initialState: StorefrontAuthState = {
  customer: null,
  isAuthenticated: false,
  isVerified: false,
  isLoading: true,
};

export const StorefrontAuthContext = createContext<StorefrontAuthContextValue>({
  ...initialState,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  verifyEmail: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
});

export const StorefrontAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StorefrontAuthState>(() => {
    const stored = localStorage.getItem('sf_auth');
    if (stored) {
      const customer = JSON.parse(stored) as Customer;
      return { customer, isAuthenticated: true, isVerified: customer.is_verified, isLoading: false };
    }
    return { ...initialState, isLoading: false };
  });

  const login = useCallback(async (email: string, password: string) => {
    if (env.IS_MOCK_MODE) {
      await new Promise(r => setTimeout(r, 200));
      const customer: Customer = {
        id: 'cust_1', name: 'Test Customer', email, phone: '9876543210',
        is_verified: true, addresses: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      localStorage.setItem('sf_auth', JSON.stringify(customer));
      setState({ customer, isAuthenticated: true, isVerified: true, isLoading: false });
    } else {
      const res = await storefrontApiClient.post<{ customer: Customer; token: string }>('/auth/storefront/login', { email, password });
      const { customer, token } = res.data;
      localStorage.setItem('sf_auth', JSON.stringify({ ...customer, token }));
      setState({ customer, isAuthenticated: true, isVerified: customer.is_verified, isLoading: false });
    }
  }, []);

  const signup = useCallback(async (data: { name: string; email: string; password: string; phone: string }) => {
    if (env.IS_MOCK_MODE) {
      await new Promise(r => setTimeout(r, 200));
      const customer: Customer = {
        id: 'cust_new', name: data.name, email: data.email, phone: data.phone,
        is_verified: false, addresses: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      localStorage.setItem('sf_auth', JSON.stringify(customer));
      setState({ customer, isAuthenticated: true, isVerified: false, isLoading: false });
    } else {
      const res = await storefrontApiClient.post<{ customer: Customer; token: string }>('/auth/storefront/signup', data);
      const { customer, token } = res.data;
      localStorage.setItem('sf_auth', JSON.stringify({ ...customer, token }));
      setState({ customer, isAuthenticated: true, isVerified: customer.is_verified, isLoading: false });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sf_auth');
    setState({ ...initialState, isLoading: false });
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    if (env.IS_MOCK_MODE) {
      await new Promise(r => setTimeout(r, 200));
      setState(prev => {
        if (prev.customer) {
          const updated = { ...prev.customer, is_verified: true };
          localStorage.setItem('sf_auth', JSON.stringify(updated));
          return { ...prev, customer: updated, isVerified: true };
        }
        return prev;
      });
    } else {
      await storefrontApiClient.post('/auth/storefront/verify-email', { token });
      setState(prev => {
        if (prev.customer) {
          const updated = { ...prev.customer, is_verified: true };
          localStorage.setItem('sf_auth', JSON.stringify(updated));
          return { ...prev, customer: updated, isVerified: true };
        }
        return prev;
      });
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (env.IS_MOCK_MODE) { await new Promise(r => setTimeout(r, 200)); return; }
    await storefrontApiClient.post('/auth/storefront/reset-password', { email });
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (env.IS_MOCK_MODE) { await new Promise(r => setTimeout(r, 200)); return; }
    await storefrontApiClient.post('/auth/storefront/update-password', { password });
  }, []);

  return (
    <StorefrontAuthContext.Provider value={{ ...state, login, signup, logout, verifyEmail, resetPassword, updatePassword }}>
      {children}
    </StorefrontAuthContext.Provider>
  );
};
