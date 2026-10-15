import { cn } from "@/lib/utils";

// The address shown in the frame: the real host, minus the protocol.
const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

// A browser window around a screenshot or clip (Q97: dressed, not raw). Used by
// the home page plates and the case-study walkthroughs so both read the same.
export function BrowserFrame({ url, children, className }: { url?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-rule bg-paper shadow-[0_40px_70px_-35px_rgb(0_0_0/0.75)]", className)}>
      <div className="flex h-8 items-center gap-1.5 border-b border-rule px-3.5">
        <span className="size-2.5 rounded-full bg-ink-3/40" />
        <span className="size-2.5 rounded-full bg-ink-3/40" />
        <span className="size-2.5 rounded-full bg-ink-3/40" />
        {url && (
          <span className="ml-3 hidden truncate rounded-md bg-sheet px-3 py-0.5 font-mono text-[0.6875rem] text-ink-3 sm:block">{host(url)}</span>
        )}
      </div>
      {children}
    </div>
  );
}
