"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Тема">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }
  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-xl"
      aria-label={isDark ? "Светлая тема" : "Тёмная тема"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
