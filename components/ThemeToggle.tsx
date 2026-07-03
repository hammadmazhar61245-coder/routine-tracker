"use client";

import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex items-center gap-2">
      <Sun className={`h-4 w-4 ${theme === "light" ? "text-warning" : "text-fg-muted"}`} />
      <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
      <Moon className={`h-4 w-4 ${theme === "dark" ? "text-accent" : "text-fg-muted"}`} />
    </div>
  );
}
