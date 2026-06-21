import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "../hooks/useSettings";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { settings } = useSettings();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (!settings) return;
    
    let activeTheme = settings.theme;
    if (activeTheme === "system") {
      activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    setTheme(activeTheme as "dark" | "light");
    
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(activeTheme);
  }, [settings]);

  return <>{children}</>;
}
