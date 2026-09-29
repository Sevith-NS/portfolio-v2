"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "@phosphor-icons/react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-ink/[0.06] hover:text-ink active:scale-95"
    >
      {mounted ? (
        dark ? <Sun size={18} weight="regular" /> : <Moon size={18} weight="regular" />
      ) : (
        <span className="size-[18px]" />
      )}
    </button>
  );
}
