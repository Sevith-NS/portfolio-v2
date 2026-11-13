"use client";

import { useEffect } from "react";

// While a case study is open its colours rule the whole document, so the cursor, text
// selection, focus rings and the header's menu take the product's highlights, not lapis.
export function CaseColours({ vars }: { vars: Record<string, string> }) {
  useEffect(() => {
    const root = document.documentElement.style;
    const keys = Object.keys(vars);
    keys.forEach((k) => root.setProperty(k, vars[k]));
    return () => keys.forEach((k) => root.removeProperty(k));
  }, [vars]);
  return null;
}
