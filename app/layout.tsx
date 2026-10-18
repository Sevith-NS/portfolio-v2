import type { Metadata, Viewport } from "next";
import { Anton, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CutLayer } from "@/components/edit/CutLayer";
import { TopBar } from "@/components/chrome/TopBar";
import { Timeline } from "@/components/chrome/Timeline";
import { Cursor } from "@/components/chrome/Cursor";
import { hex } from "@/lib/theme";

// The title card: tall, condensed, heavy.
const display = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
// Everything you read: a mono, like the HUD of an edit.
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Sevith Sadashiva · Product engineer",
    template: "%s · Sevith Sadashiva",
  },
  description:
    "Product engineer in Bangalore: I design the interface, define the product and ship the code. Technical Writer at Digital.ai, building AI products end to end.",
  icons: ["/1.svg"],
};

export const viewport: Viewport = { themeColor: hex("void") };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      {/* Room at the bottom for the timeline bar. */}
      <body className="pb-9">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-blood focus:px-4 focus:py-2 focus:text-bone"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <TransitionProvider>
            <TopBar />
            {children}
            <Timeline />
          </TransitionProvider>
        </SmoothScroll>
        <CutLayer />
        <Cursor />
      </body>
    </html>
  );
}
