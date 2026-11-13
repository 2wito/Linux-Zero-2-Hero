/**
 * Renders light inline markup inside a plain string prop (quiz text, checklist items, recap cards):
 * `backticks` become inline code (LTR, bidi-isolated) and **double asterisks** become bold.
 * So data props can say "הריצו `sudo apt update`" or "מציגה את **הסוף**".
 */
export function InlineCode({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`|\*\*[^*]+\*\*)/).map((part, i) => {
        if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} dir="ltr" className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.88em] [overflow-wrap:anywhere]">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
}
