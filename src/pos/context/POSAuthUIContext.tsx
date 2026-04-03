// pos-auth-ui-context.tsx
import React, { createContext, useContext, useState, useCallback } from "react";

type POSAuthUIContextType = {
  showBack: boolean;
  setShowBack: (val: boolean) => void;
  onBack?: () => void;
  setOnBack: (cb?: () => void) => void;
};

const POSAuthUIContext = createContext<POSAuthUIContextType | null>(null);

export const POSAuthUIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [showBack, setShowBack] = useState(false);
  const [onBack, setOnBack] = useState<(() => void) | undefined>();

  const value = {
    showBack,
    setShowBack,
    onBack,
    setOnBack,
  };

  return (
    <POSAuthUIContext.Provider value={value}>
      {children}
    </POSAuthUIContext.Provider>
  );
};

export const usePOSAuthUI = () => {
  const ctx = useContext(POSAuthUIContext);
  if (!ctx)
    throw new Error("usePOSAuthUI must be used within POSAuthUIProvider");
  return ctx;
};
