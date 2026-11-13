import { InlineCode } from "@/components/mdx/inline-code";

export type RecapItem = { title: string; body: string };

/**
 * End-of-chapter summary: one card per key idea. Titles are often commands (`ls`, `cd`), so they render LTR-safe;
 * bodies support `backticks` for inline code.
 */
export function RecapCards({ items, title }: { items: RecapItem[]; title?: string }) {
  return (
    <section aria-label={title} className="mt-6">
      {title && <p className="font-bold">{title}</p>}
      <ol className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4 rounded-xl border border-line bg-surface p-4">
            <span aria-hidden className="font-display text-2xl leading-none text-accent tabular-nums">
              {i + 1}
            </span>
            <span className="min-w-0">
              <span dir="auto" className="block font-bold leading-snug">
                <InlineCode text={item.title} />
              </span>
              <span className="mt-1.5 block text-base leading-7 text-muted">
                <InlineCode text={item.body} />
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
