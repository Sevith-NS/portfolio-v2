"use client";

import Link from "next/link";
import { usePageTransition } from "./TransitionProvider";

// Internal links route through the curtain; modifier clicks keep native behaviour.
export function TransitionLink({
  href,
  label,
  className,
  children,
  onClick,
  ...rest
}: {
  href: string;
  label?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  const { navigate } = usePageTransition();
  return (
    <Link
      href={href}
      className={className}
      scroll={false}
      onClick={(e) => {
        onClick?.();
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href, label);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
