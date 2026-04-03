import { useContext } from 'react';
import { StorefrontAuthContext } from './StorefrontAuthContext';

export function useStorefrontAuth() {
  const context = useContext(StorefrontAuthContext);
  if (!context) throw new Error('useStorefrontAuth must be used within StorefrontAuthProvider');
  return context;
}
