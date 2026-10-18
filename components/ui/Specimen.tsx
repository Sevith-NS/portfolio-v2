"use client";

import { useState } from "react";

// The two voices this site is set in, with their one job each. Type anything.
const faces = [
  { name: "Anton", role: "the title card. tall, condensed, heavy, only ever big.", className: "title" },
  { name: "IBM Plex Mono", role: "everything you read, and the HUD around the edges.", className: "font-mono" },
];

export function Specimen() {
  const [text, setText] = useState("Goated taste");
  return (
    <div className="border-2 border-line p-5 md:p-8">
      <label htmlFor="specimen" className="hud text-fg">
        type anything
      </label>
      <input
        id="specimen"
        value={text}
        maxLength={40}
        onChange={(e) => setText(e.target.value)}
        className="mt-2 block w-full max-w-sm border-2 border-line bg-transparent px-4 py-2.5 text-fg outline-none focus:border-blood"
      />
      <ul className="mt-6">
        {faces.map((f) => (
          <li key={f.name} className="border-t border-line py-6">
            <p className={`${f.className} break-words text-[clamp(2.4rem,7vw,6rem)] leading-[0.9]`}>{text || "Aa"}</p>
            <p className="hud mt-3">
              {f.name.toLowerCase()}: {f.role}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
