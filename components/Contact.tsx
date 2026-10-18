import { email, resumeLink, socialMedia } from "@/data";
import { Reveal } from "@/components/motion/Reveal";
import { Form } from "@/components/ui/Form";
import { CopyEmail } from "@/components/ui/CopyEmail";

// The last scene on every page: the ask, the ways to reach me, the call
// sheet (form), then the end card.
export default function Contact() {
  return (
    <footer id="contact" data-scene="Contact" className="tone-void relative overflow-x-clip border-t border-soot px-4 pt-28 md:px-6 md:pt-40">
      <div className="mx-auto grid max-w-page gap-16 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-6">
          <h2 className="title cut-stagger text-[clamp(3.5rem,8.6vw,8.5rem)]">
            <span className="block">Let&apos;s build</span>
            <span className="block">something.</span>
          </h2>
          <p className="mt-8 max-w-[44ch] text-smoke">Got a product that needs designing, building, or both? Freelance or full-time. Tell me what you&apos;re making.</p>
          <a href={`mailto:${email}`} className="cutlink mt-10 inline-block break-all text-[clamp(1.2rem,2.2vw,1.75rem)] font-semibold">
            {email}
          </a>
          <div className="mt-6">
            <CopyEmail />
          </div>
          <ul className="mt-10 flex flex-wrap gap-6">
            {socialMedia.map((s) => (
              <li key={s.id}>
                <a href={s.link} target="_blank" rel="noopener noreferrer" className="cutlink">
                  {s.name}
                </a>
              </li>
            ))}
            <li>
              <a href={resumeLink} target="_blank" rel="noopener noreferrer" className="cutlink">
                Resume
              </a>
            </li>
          </ul>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-6">
          <Form />
        </Reveal>
      </div>

      <p aria-hidden className="title mt-28 select-none text-center text-[30vw] leading-[0.78] text-soot">
        Sevith
      </p>
      <div className="hud mx-auto flex max-w-page flex-wrap items-center justify-between gap-3 border-t border-soot py-6">
        <span>end of tape. © {new Date().getFullYear()} sevith sadashiva. all rights reserved. cut in bangalore.</span>
        <a href="#main" className="cutlink">
          rewind
        </a>
      </div>
    </footer>
  );
}
