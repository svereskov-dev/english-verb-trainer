import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "../hooks/useSettings";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { settings } = useSettings();
  const [theme, setTheme] = useState<"dark">("dark");

  useEffect(() => {
    if (!settings) return;

    // Dark Mode is the only supported theme. Light Mode is coming soon.
    // Any stored value other than "dark" is ignored and falls back to dark.
    const activeTheme = settings.theme === "dark" ? "dark" : "dark";

    setTheme(activeTheme);

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(activeTheme);
  }, [settings]);

  return <>{children}</>;
}
