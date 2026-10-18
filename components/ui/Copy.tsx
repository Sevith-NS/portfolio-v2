// Keyword emphasis for data-driven copy: *wrap a phrase in asterisks* in any
// string and it renders bold with a blood marker rule under it (.key).
// No hooks, so server components can use it too.
export function Copy({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\*([^*]+)\*/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="key">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </span>
  );
}
