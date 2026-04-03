import React from "react";
import { Sun, Moon, Laptop, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { STAFF_PALETTE_OPTIONS, useStaffUiPalette } from "@/staff/context/StaffUiPaletteContext";

const ThemeIcon: React.FC<{ theme: string | undefined }> = ({ theme }) => {
  if (theme === "dark") return <Moon className="h-4 w-4" />;
  if (theme === "light") return <Sun className="h-4 w-4" />;
  return <Laptop className="h-4 w-4" />;
};

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { palette, setPalette } = useStaffUiPalette();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <ThemeIcon theme={theme} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Appearance</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="h-4 w-4 mr-2" /> System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5" /> Accent palette
        </DropdownMenuLabel>
        {STAFF_PALETTE_OPTIONS.map((opt) => (
          <DropdownMenuItem key={opt.id} onClick={() => setPalette(opt.id)} className={palette === opt.id ? "bg-accent" : ""}>
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
