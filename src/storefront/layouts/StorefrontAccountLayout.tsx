import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Package, Heart, User, RotateCcw, LayoutDashboard } from 'lucide-react';
import { useStorefrontAuth } from '@/storefront/auth/useStorefrontAuth';

const accountLinks = [
  { to: '/account', label: 'Overview', end: true, icon: LayoutDashboard },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/returns', label: 'Returns', icon: RotateCcw },
];

export const StorefrontAccountLayout: React.FC = () => {
  const { customer } = useStorefrontAuth();

  return (
    <section className="bg-[hsl(var(--sf-cream))] min-h-screen">
      <div className="bg-[hsl(var(--sf-brown))] py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[hsl(var(--sf-gold))] flex items-center justify-center text-[hsl(var(--sf-brown))] text-xl font-black">
              {customer?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-tight">{customer?.name || 'My Account'}</h1>
              <p className="text-white/50 text-sm">{customer?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-56 shrink-0">
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {accountLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-[hsl(var(--sf-red))] text-white font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`
                  }
                >
                  <link.icon className="w-4 h-4 shrink-0" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  );
};
