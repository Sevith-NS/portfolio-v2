import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// The site's one motion curve, after Lusion: a soft start and a long settle. Every reveal,
// hover and page change runs on it, so they read as one motion.
export const EASE = [0.35, 0, 0, 1] as const
