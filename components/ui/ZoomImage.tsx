"use client";

import { useRef } from "react";
import { X } from "@phosphor-icons/react";

// A screenshot you can open, fitted whole to the screen. Walkthrough screenshots are dense UI
// shown small, so a click opens them in a native <dialog>: Escape, focus and
// screen-reader semantics come with it. The cursor says "Zoom" over them.
// `w` and `h` are the file's own size: the page holds its room before the lazy image arrives,
// so nothing below it moves while you scroll past.
export function ZoomImage({ src, alt, w, h }: { src: string; alt: string; w?: number; h?: number }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} data-cursor="Zoom" className="block w-full" aria-label={`Open full size: ${alt}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={w} height={h} loading="lazy" className="block h-auto w-full" />
      </button>
      <dialog
        ref={dialog}
        data-lenis-prevent
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto max-h-[92vh] max-w-[96vw] overflow-hidden rounded-2xl border border-rule bg-paper p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full border border-rule bg-paper/90 text-ink shadow-[0_8px_24px_-8px_rgb(var(--shade)/0.5)] backdrop-blur-sm hover:border-ink"
        >
          <X size={18} />
        </button>
        {/* The whole picture, fitted to the screen. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="block h-auto max-h-[92vh] w-auto max-w-[96vw]" />
      </dialog>
    </>
  );
}
