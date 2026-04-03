import React from 'react';
import { Outlet } from 'react-router-dom';

export const StorefrontAuthLayout: React.FC = () => {
  return (
    <div className="sf-theme min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <Outlet />
      </div>
    </div>
  );
};
