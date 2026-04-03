import { ErrorBoundary } from '@/components/ui/error-boundary';
import AuthModal from '@/storefront/components/auth/AuthModal';
import { AuthModalProvider } from '@/storefront/components/auth/AuthModalContext';
import CartDrawer from '@/storefront/components/cart/CartDrawer';
import { AnnouncementBar } from '@/storefront/components/home/AnnouncementBar';
import { StorefrontFooter } from '@/storefront/components/StorefrontFooter';
import { StorefrontHeader } from '@/storefront/components/StorefrontHeader';
import React from 'react';
import { Outlet } from 'react-router-dom';

export const StorefrontLayout: React.FC = () => {
  return (
    <AuthModalProvider>
      <div className="sf-theme min-h-screen flex flex-col">
        <AnnouncementBar />
        <StorefrontHeader />
        <main className="flex-1">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <StorefrontFooter />
        <AuthModal />
        <CartDrawer />
      </div>
    </AuthModalProvider>
  );
};
