import { TransitionLink } from "@/components/transition/TransitionLink";

export default function NotFound() {
  return (
    <main id="main" data-scene="Lost" className="tone-void relative flex min-h-[100svh] flex-col justify-end px-4 pb-20 md:px-6">
      <div className="mx-auto w-full max-w-page">
        <p className="hud">404, no such frame</p>
        <h1 className="title mt-4 text-[clamp(4rem,16vw,16rem)]">Signal lost.</h1>
        <p className="mt-6 max-w-[44ch] text-[1.0625rem]">This page got cut in the edit. The rest of the tape is still here.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <TransitionLink href="/" label="Sevith" className="btn btn-solid">
            Back to the start
          </TransitionLink>
          <TransitionLink href="/#work" label="Work" className="btn">
            See the work
          </TransitionLink>
        </div>
      </div>
    </main>
  );
}
