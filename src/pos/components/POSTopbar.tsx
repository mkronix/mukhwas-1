import { ThemeToggle } from "@/admin/components/ThemeToggle";
import { Menu } from "lucide-react";
import React from "react";

interface POSTopbarProps {
  staffName: string | undefined;
  onMenuOpen: () => void;
}

export const POSTopbar: React.FC<POSTopbarProps> = ({
  staffName,
  onMenuOpen,
}) => (
  <header className="h-14 border-b border-border bg-card/80 backdrop-blur-lg flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
    <button
      onClick={onMenuOpen}
      className="lg:hidden text-muted-foreground hover:text-foreground"
    >
      <Menu className="h-5 w-5" />
    </button>
    <div className="flex items-center gap-2 ml-auto">
      <ThemeToggle />
      <span className="text-sm text-muted-foreground">{staffName}</span>
    </div>
  </header>
);
