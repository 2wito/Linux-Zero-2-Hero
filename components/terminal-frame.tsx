/**
 * The macOS-style window chrome shared by every terminal on the site (TerminalWindow in chapters, HeroTerminal
 * on the landing page): dark body, traffic-light dots, a path title and an optional action (copy / replay).
 * The bar is always LTR, like a real window title bar.
 */
export function TerminalFrame({
  title,
  action,
  className = "",
  children,
  ...rest
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "title">) {
  return (
    <div
      {...rest}
      className={`overflow-hidden rounded-2xl bg-term text-term-ink shadow-[0_20px_40px_-28px_rgba(22,18,12,0.7)] ring-1 ring-black/10 dark:ring-white/10 ${className}`}
    >
      <div dir="ltr" className="flex items-center gap-2 border-b border-white/10 py-2 ps-4 pe-2">
        <span aria-hidden className="size-3 shrink-0 rounded-full bg-[#ff5f57]" />
        <span aria-hidden className="size-3 shrink-0 rounded-full bg-[#febc2e]" />
        <span aria-hidden className="size-3 shrink-0 rounded-full bg-[#28c840]" />
        <span className="ms-3 min-w-0 truncate font-mono text-xs text-term-dim">{title}</span>
        {/* The empty span keeps the bar height when there's no action. */}
        <span className="ms-auto flex h-7 items-center">{action}</span>
      </div>
      {children}
    </div>
  );
}
