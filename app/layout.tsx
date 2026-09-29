import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Libre_Caslon_Text, Nothing_You_Could_Do } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./provider";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Cursor } from "@/components/motion/Cursor";

const serif = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const script = Nothing_You_Could_Do({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Sevith Sadashiva · Product builder",
    template: "%s · Sevith Sadashiva",
  },
  description:
    "Product builder in Bangalore: I design, define and ship AI products. Technical Writer at Digital.ai, aspiring AI PM and product designer.",
  icons: ["/1.svg"],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#090D1E" },
  ],
};

const contract = `
THESIS: A product builder's portfolio with studio-grade polish: calm white space, warm serif statements, one lapis accent, and motion that feels physical (Lenis scroll, spring cursor, blur-in reveals).
OWN-WORLD: White by day, lapis-navy by night. Lapis #002DB4 is the only accent. Libre Caslon Text for statements (italic for outcomes), Geist for labels and body, one lapis handwritten note per section. Project plates are soft pastel gradients with the product rising behind frosted glass.
STORY: Visitor meets a product builder aiming for AI PM and product design roles, scrolls through case plates, sees how Sevith works and who Sevith is off the clock, then emails or downloads the resume.
FIRST VIEWPORT: Centered serif statement, a lapis scribble crossing it, pill nav with the active item in lapis, a quiet scroll cue.
FORM: Brief-pinned to the design language of the user's reference (not its content), seed 43f73bd6.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${serif.variable} ${script.variable}`}
    >
      <body>
        {/* Internal design notes: kept out of production HTML. */}
        {process.env.NODE_ENV === "development" && <div hidden dangerouslySetInnerHTML={{ __html: `<!--${contract}-->` }} />}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-on-hl"
        >
          Skip to content
        </a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <SmoothScroll>
            <TransitionProvider>{children}</TransitionProvider>
          </SmoothScroll>
          <Cursor />
        </ThemeProvider>
      </body>
    </html>
  );
}
