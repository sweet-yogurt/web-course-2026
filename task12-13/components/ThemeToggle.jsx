"use client";

import { useEffect, useState } from "react";
import { loadSettings, saveSettings } from "@/lib/settings";
import { MoonIcon, SunIcon } from "./Icons";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = loadSettings();
    setTheme(saved.theme);
    document.body.classList.toggle("dark", saved.theme === "dark");
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.body.classList.toggle("dark", next === "dark");
    saveSettings({ theme: next });
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      title="Переключить тему"
      aria-label="Переключить тему"
    >
      {mounted && theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
