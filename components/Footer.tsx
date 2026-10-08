import { ArrowUp, ArrowUpRight, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { email, resumeLink, socialMedia } from "@/data";
import { cn } from "@/lib/utils";
import { Form } from "./ui/Form";
import { CopyEmail } from "./ui/CopyEmail";
import { GlassPaint } from "./ui/GlassPaint";

const wordmark =
  "select-none whitespace-nowrap text-center font-serif text-[22vw] font-normal leading-[0.8] tracking-[-0.02em] md:text-[15rem] lg:text-[17.5rem]";

const Footer = () => {
  return (
    <footer id="contact" className="mx-auto max-w-page px-4 pb-8 pt-20 md:px-8 md:pt-24">
      <div className="grid gap-12 border-t border-rule pt-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <h2 className="section-title">Let&apos;s build something.</h2>
          <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-ink-2">
            Hiring for a product or design role, or have something to build? Either way, I&apos;d like to hear about it.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4">
            <a
              href={`mailto:${email}`}
              className="group inline-flex items-center gap-2 font-serif text-2xl font-normal tracking-[-0.02em] text-accent underline decoration-accent/30 underline-offset-[6px] hover:decoration-accent md:text-3xl"
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

      {/* The sign-off: full-bleed, edge to edge. Hover it to wipe the lapis
          version through, like clearing a circle of fogged glass. */}
      <div aria-hidden className="relative left-1/2 mt-20 w-screen -translate-x-1/2 overflow-hidden">
        <p className={cn(wordmark, "text-accent/[0.12]")}>sevith.</p>
        <GlassPaint className={cn(wordmark, "absolute inset-0 flex items-center justify-center text-accent")}>sevith.</GlassPaint>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-rule pt-6">
        <p className="note">© sevith sadashiva {new Date().getFullYear()}. all rights reserved. created in bangalore</p>
        <a href="#main" className="note inline-flex items-center gap-1.5 hover:text-ink">
          Back to top <ArrowUp size={13} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
