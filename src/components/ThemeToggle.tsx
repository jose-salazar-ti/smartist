"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className="btn-icon" 
        style={{ width: "44px", height: "44px" }}
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="btn-icon flex items-center justify-center transition-all duration-300 active:scale-90"
      aria-label="Alternar tema"
      style={{ cursor: "pointer", position: "relative" }}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="h-5 w-5 text-amber-400 transition-transform duration-500 hover:rotate-90" />
        ) : (
          <Moon className="h-5 w-5 text-indigo-600 transition-transform duration-500 hover:-rotate-45" />
        )}
      </div>
    </button>
  );
}
