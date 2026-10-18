"use client";

import { useRef } from "react";

// A screenshot you can open full size. Walkthrough screenshots are dense UI
// shown small, so a click opens them in a native <dialog>: Escape, focus and
// screen-reader semantics come with it. The cursor says "Zoom" over them.
export function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} data-cursor="zoom" className="block w-full" aria-label={`Open full size: ${alt}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="block h-auto w-full" />
      </button>
      <dialog
        ref={dialog}
        data-lenis-prevent
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto max-h-[92vh] w-[min(96vw,110rem)] overflow-auto border-2 border-bone bg-void p-0 backdrop:bg-void/90"
      >
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label="Close"
          className="btn btn-solid absolute right-3 top-3 z-10 h-9 px-3"
        >
          close
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="block h-auto w-full" />
      </dialog>
    </>
  );
}
