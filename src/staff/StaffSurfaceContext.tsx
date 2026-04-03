import React, { createContext } from "react";

import type { StaffBasePath } from "@/shared/hooks/useSurface";

export type { StaffBasePath };
export { useStaffBasePath } from "@/shared/hooks/useSurface";

const StaffSurfaceContext = createContext<{ basePath: StaffBasePath }>({
  basePath: "/admin",
});

export const StaffSurfaceProvider: React.FC<{
  basePath: StaffBasePath;
  children: React.ReactNode;
}> = ({ basePath, children }) => (
  <StaffSurfaceContext.Provider value={{ basePath }}>
    {children}
  </StaffSurfaceContext.Provider>
);
