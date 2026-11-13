"use client";

import Link from "next/link";
import { usePageTransition } from "./TransitionProvider";

// Internal links route through the page change; modifier clicks keep native behaviour.
// A link holding a `[data-zoom]` frame has the page push into that frame on the way.
export function TransitionLink({
  href,
  className,
  children,
  onClick,
  ...rest
}: {
  href: string;
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
        navigate(href, e.currentTarget.querySelector<HTMLElement>("[data-zoom]") ?? undefined);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
