import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStorefrontAuth } from './useStorefrontAuth';
import { useAuthModal } from '@/storefront/components/auth/AuthModalContext';

interface Props {
  children: React.ReactNode;
  requireVerified?: boolean;
}

export const StorefrontProtectedRoute: React.FC<Props> = ({ children, requireVerified = false }) => {
  const { isAuthenticated, isVerified } = useStorefrontAuth();
  const { open } = useAuthModal();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      open('login');
    } else if (requireVerified && !isVerified) {
      open('verify-email');
    }
  }, [isAuthenticated, isVerified, requireVerified, open, location.pathname]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Please sign in to continue</h2>
          <p className="text-muted-foreground text-sm">You need to be logged in to access this page.</p>
          <button onClick={() => open('login')} className="mt-4 px-6 py-2.5 rounded-xl bg-[hsl(var(--sf-red))] text-white font-bold text-sm hover:bg-[hsl(var(--sf-brown))] transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (requireVerified && !isVerified) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Email verification required</h2>
          <p className="text-muted-foreground text-sm">Please verify your email to continue.</p>
          <button onClick={() => open('verify-email')} className="mt-4 px-6 py-2.5 rounded-xl bg-[hsl(var(--sf-red))] text-white font-bold text-sm hover:bg-[hsl(var(--sf-brown))] transition-colors">
            Verify Email
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
