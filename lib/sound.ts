"use client";

import { useSyncExternalStore } from "react";

// Sound is off until the visitor turns it on, and the choice is remembered.
// The header's button flips it; the ambient track and interface sounds (still to
// come, once Sevith picks them) read it.
const KEY = "sound";
const listeners = new Set<() => void>();
let current: boolean | null = null;

function read() {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

export function setSound(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Storage blocked (private mode): the switch still works for this page.
  }
  current = on;
  listeners.forEach((l) => l());
}

export function useSound() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => (current ??= read()),
    () => false,
  );
}
