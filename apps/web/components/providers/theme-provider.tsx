"use client";

import * as React from "react";
import { useThemeStore } from "@/stores/theme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const themeVariables: Record<string, Record<string, string>> = {
  dark: {
    "--color-bg": "#0a0a0f",
    "--color-surface": "#12121a",
    "--color-elevated": "#1a1a24",
    "--color-border": "#2a2a3a",
    "--color-text": "#e4e4e7",
    "--color-text-secondary": "#a1a1aa",
  },
  light: {
    "--color-bg": "#fafafa",
    "--color-surface": "#ffffff",
    "--color-elevated": "#f5f5f5",
    "--color-border": "#e5e5e5",
    "--color-text": "#18181b",
    "--color-text-secondary": "#71717a",
  },
  medium: {
    "--color-bg": "#2a2a35",
    "--color-surface": "#3a3a48",
    "--color-elevated": "#4a4a5a",
    "--color-border": "#5a5a6a",
    "--color-text": "#f0f0f5",
    "--color-text-secondary": "#b0b0c0",
  },
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark", "medium", "light");
    root.classList.add(theme);

    // Apply CSS variables
    const vars = themeVariables[theme];
    if (vars) {
      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [theme]);

  if (!mounted) {
    return <div className="hidden">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const ThemeContext = React.createContext<{
  theme: "dark" | "light" | "medium";
  setTheme: (theme: "dark" | "light" | "medium") => void;
}>({
  theme: "dark",
  setTheme: () => {},
});
