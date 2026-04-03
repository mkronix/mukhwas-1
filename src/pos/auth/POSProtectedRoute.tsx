import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePOSAuth } from './usePOSAuth';

export const POSProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = usePOSAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/pos/login" state={{ from: location }} replace />;
  return <>{children}</>;
};
