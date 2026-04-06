import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light" | "medium";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const themeCycle: Theme[] = ["light", "medium", "dark"];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggleTheme: () => {
        const currentIndex = themeCycle.indexOf(get().theme);
        const nextIndex = (currentIndex + 1) % themeCycle.length;
        const nextTheme = themeCycle[nextIndex];
        set({ theme: nextTheme });
        applyTheme(nextTheme);
      },
    }),
    {
      name: "orbitalk-theme",
    },
  ),
);

export const useTheme = useThemeStore;

function applyTheme(theme: Theme) {
  if (typeof window !== "undefined") {
    const root = document.documentElement;
    root.classList.remove("light", "medium", "dark");
    root.classList.add(theme);

    // Apply CSS variables based on theme
    if (theme === "dark") {
      root.style.setProperty("--color-bg", "#0a0a0f");
      root.style.setProperty("--color-surface", "#12121a");
      root.style.setProperty("--color-elevated", "#1a1a24");
      root.style.setProperty("--color-border", "#2a2a3a");
      root.style.setProperty("--color-text", "#e4e4e7");
      root.style.setProperty("--color-text-secondary", "#a1a1aa");
    } else if (theme === "light") {
      root.style.setProperty("--color-bg", "#fafafa");
      root.style.setProperty("--color-surface", "#ffffff");
      root.style.setProperty("--color-elevated", "#f5f5f5");
      root.style.setProperty("--color-border", "#e5e5e5");
      root.style.setProperty("--color-text", "#18181b");
      root.style.setProperty("--color-text-secondary", "#71717a");
    } else {
      root.style.setProperty("--color-bg", "#2a2a35");
      root.style.setProperty("--color-surface", "#3a3a48");
      root.style.setProperty("--color-elevated", "#4a4a5a");
      root.style.setProperty("--color-border", "#5a5a6a");
      root.style.setProperty("--color-text", "#f0f0f5");
      root.style.setProperty("--color-text-secondary", "#b0b0c0");
    }
  }
}

// Apply theme on initial load
if (typeof window !== "undefined") {
  const savedTheme = localStorage.getItem("orbitalk-theme");
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      if (parsed.state?.theme) {
        applyTheme(parsed.state.theme);
      }
    } catch {
      applyTheme("dark");
    }
  } else {
    applyTheme("dark");
  }
}
