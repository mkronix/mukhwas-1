import * as React from "react";

import { cn } from "@/lib/utils";
import type { StaffBasePath } from "@/staff/StaffSurfaceContext";

export type StaffUiSurface = "admin" | "pos";

export type StaffPaletteId = "default" | "ocean" | "rose" | "amber" | "forest";

export const STAFF_PALETTE_STORAGE: Record<StaffUiSurface, string> = {
  admin: "mukhwas_staff_palette_admin",
  pos: "mukhwas_staff_palette_pos",
};

export const STAFF_PALETTE_OPTIONS: { id: StaffPaletteId; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "ocean", label: "Ocean" },
  { id: "rose", label: "Rose" },
  { id: "amber", label: "Amber" },
  { id: "forest", label: "Forest" },
];

const isPaletteId = (v: string): v is StaffPaletteId =>
  STAFF_PALETTE_OPTIONS.some((o) => o.id === v);

function readStored(surface: StaffUiSurface): StaffPaletteId {
  try {
    const raw = localStorage.getItem(STAFF_PALETTE_STORAGE[surface]);
    if (raw && isPaletteId(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "default";
}

export function staffBasePathToSurface(basePath: StaffBasePath): StaffUiSurface {
  return basePath.startsWith("/pos") ? "pos" : "admin";
}

type StaffUiPaletteContextValue = {
  surface: StaffUiSurface;
  palette: StaffPaletteId;
  setPalette: (id: StaffPaletteId) => void;
};

const StaffUiPaletteContext = React.createContext<StaffUiPaletteContextValue | null>(null);

export const StaffUiPaletteProvider: React.FC<{
  surface: StaffUiSurface;
  children: React.ReactNode;
}> = ({ surface, children }) => {
  const [palette, setPaletteState] = React.useState<StaffPaletteId>(() =>
    typeof window === "undefined" ? "default" : readStored(surface),
  );

  React.useEffect(() => {
    setPaletteState(readStored(surface));
  }, [surface]);

  const setPalette = React.useCallback(
    (id: StaffPaletteId) => {
      setPaletteState(id);
      try {
        localStorage.setItem(STAFF_PALETTE_STORAGE[surface], id);
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new CustomEvent("staff-palette-change", { detail: { surface, id } }));
    },
    [surface],
  );

  const value = React.useMemo(
    () => ({ surface, palette, setPalette }),
    [surface, palette, setPalette],
  );

  return (
    <StaffUiPaletteContext.Provider value={value}>
      <div className={cn("staff-app min-h-full", palette !== "default" && `staff-palette-${palette}`)}>
        {children}
      </div>
    </StaffUiPaletteContext.Provider>
  );
};

export function useStaffUiPalette(): StaffUiPaletteContextValue {
  const ctx = React.useContext(StaffUiPaletteContext);
  if (!ctx) {
    throw new Error("useStaffUiPalette must be used within StaffUiPaletteProvider");
  }
  return ctx;
}
