import React, { createContext, useContext, useState, useCallback } from 'react';

export type AuthModalView = 'login' | 'signup' | 'verify-email' | 'forgot-password' | 'reset-password' | null;

interface AuthModalContextValue {
  view: AuthModalView;
  open: (view: AuthModalView) => void;
  close: () => void;
  email: string;
  setEmail: (e: string) => void;
}

const AuthModalContext = createContext<AuthModalContextValue>({
  view: null, open: () => {}, close: () => {}, email: '', setEmail: () => {},
});

export const useAuthModal = () => useContext(AuthModalContext);

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState<AuthModalView>(null);
  const [email, setEmail] = useState('');
  const open = useCallback((v: AuthModalView) => setView(v), []);
  const close = useCallback(() => { setView(null); setEmail(''); }, []);
  return (
    <AuthModalContext.Provider value={{ view, open, close, email, setEmail }}>
      {children}
    </AuthModalContext.Provider>
  );
};
