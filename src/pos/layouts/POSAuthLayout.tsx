import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { ChevronsLeft, Moon, Sun } from "lucide-react";
import { StaffUiPaletteProvider } from "@/staff/context/StaffUiPaletteContext";
import { usePOSAuthUI } from "../context/POSAuthUIContext";

export const POSAuthLayout: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { showBack, onBack } = usePOSAuthUI();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <StaffUiPaletteProvider surface="pos">
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* subtle background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 min-w-[80px]">
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              <ChevronsLeft className="h-4 w-4" />
              Back
            </button>
          )}
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* content */}
      <div className="relative z-[1] flex flex-col items-center justify-center min-h-screen px-4">
        <div className="my-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            The Mukhwas Company
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Point of Sale</p>
        </div>

        <div className="w-full max-w-2xl">
          <Outlet />
        </div>
      </div>
    </div>
    </StaffUiPaletteProvider>
  );
};
