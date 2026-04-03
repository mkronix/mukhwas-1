import { useContext } from 'react';
import { POSAuthContext } from './POSAuthContext';

export function usePOSAuth() {
  const context = useContext(POSAuthContext);
  if (!context) throw new Error('usePOSAuth must be used within POSAuthProvider');
  return context;
}
