import { ArrowUp, ArrowUpRight, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { email, resumeLink, socialMedia } from "@/data";
import { cn } from "@/lib/utils";
import { Form } from "./ui/Form";
import { CopyEmail } from "./ui/CopyEmail";
import { GlassPaint } from "./ui/GlassPaint";
import { RiseSheet } from "./motion/RiseSheet";
import { PixelCats } from "./PixelCats";
import { CreamHint } from "./CreamHint";

// "sevith." is 2.49em wide in Neue Montreal at this tracking, so 36vw spans ~90% of the screen; capped for big monitors.
const wordmark = "select-none whitespace-nowrap text-center font-mark text-[min(36vw,40rem)] font-medium leading-[0.86] tracking-[-0.045em]";

const Footer = () => {
  return (
    // The wrap rises over the page as its own sheet (see RiseSheet).
    <footer id="contact" className="mt-16 overflow-x-clip md:mt-24">
      <RiseSheet className="relative border-t border-rule bg-sheet shadow-[0_-30px_60px_-40px_rgb(var(--shade)/0.6)]">
      {/* Simba and Cream, in pixels, on the card's top edge: Cream irritating
          him, Simba keeping his calm (see PixelCats). */}
      <PixelCats className="z-10" />
      <div className="mx-auto max-w-page px-4 pb-8 pt-20 md:px-8 md:pt-24">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent">Say hi</p>
          <h2 className="mt-5 font-wide text-[clamp(2rem,4.6vw,3.6rem)] font-semibold uppercase leading-[1] tracking-[-0.01em] text-ink">
            Let&apos;s build something.
          </h2>
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-ink-2">
            Got a product that needs designing, building, or both? Freelance or full-time, tell me what you&apos;re making.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4">
            <a
              href={`mailto:${email}`}
              className="group inline-flex items-center gap-2 text-xl font-medium tracking-[-0.01em] text-accent underline decoration-accent/30 underline-offset-[6px] hover:decoration-accent md:text-2xl"
            >
              <EnvelopeSimple size={24} />
              {email}
            </a>
            <CopyEmail />
            <ul className="mt-2 flex flex-wrap gap-6 text-[0.9375rem]">
              {socialMedia.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-ink-2 underline decoration-rule hover:text-ink hover:decoration-ink"
                  >
                    {s.name}
                    <ArrowUpRight size={14} />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-ink-2 underline decoration-rule hover:text-ink hover:decoration-ink"
                >
                  Resume
                  <ArrowUpRight size={14} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <Form />
        </div>
      </div>

      {/* The sign-off: full-bleed, edge to edge. Hover it to wipe the lamp-lit
          version through, like clearing a circle of fogged glass. */}
      <div aria-hidden className="relative left-1/2 mt-20 w-screen -translate-x-1/2 overflow-hidden">
        <p className={cn(wordmark, "text-warm/[0.14]")}>sevith.</p>
        <GlassPaint className={cn(wordmark, "absolute inset-0 flex items-center justify-center text-warm")}>sevith.</GlassPaint>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-rule pt-6">
        <div className="flex flex-col gap-2">
          <p className="note">© sevith sadashiva {new Date().getFullYear()}. all rights reserved. created in bangalore.</p>
          <CreamHint />
        </div>
        <a href="#main" className="note inline-flex items-center gap-1.5 hover:text-ink">
          Back to top <ArrowUp size={13} />
        </a>
      </div>
      </div>
      </RiseSheet>
    </footer>
  );
};

export default Footer;
