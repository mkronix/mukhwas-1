import React from 'react';
import { Outlet } from 'react-router-dom';
import { StaffUiPaletteProvider } from '@/staff/context/StaffUiPaletteContext';

export const AdminAuthLayout: React.FC = () => {
  return (
    <StaffUiPaletteProvider surface="admin">
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.03),transparent_50%)]" />
      <div className="w-full max-w-[420px] px-4 relative z-10">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <Outlet />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Mukhwas Commerce OS
        </p>
      </div>
    </div>
    </StaffUiPaletteProvider>
  );
};
