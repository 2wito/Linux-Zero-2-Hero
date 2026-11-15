import { Children, isValidElement, type ReactElement } from "react";
import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/callout";
import { Challenges } from "@/components/challenges";
import { CheatSheet } from "@/components/cheat-sheet";
import { Feedback, FinishProgress } from "@/components/finish";
import { Glossary } from "@/components/glossary";
import { Checklist } from "@/components/mdx/checklist";
import { CodeBlock } from "@/components/mdx/code-block";
import { Distro, DistroTabs } from "@/components/mdx/distro-tabs";
import { Exercise, Solution } from "@/components/mdx/exercise";
import { Cmd, En, Kbd } from "@/components/mdx/inline";
import { MiniQuiz } from "@/components/mdx/mini-quiz";
import { RecapCards } from "@/components/mdx/recap-cards";
import { Steps } from "@/components/mdx/steps";
import { Resources } from "@/components/resources";
import { TerminalSimulator } from "@/components/terminal-simulator";
import { TerminalWindow } from "@/components/terminal-window";
import { CommandAnatomy } from "@/components/tools/command-anatomy";
import { CronExplainer } from "@/components/tools/cron-explainer";
import { PermissionCalculator } from "@/components/tools/permission-calculator";

type ElementProps = Record<string, unknown> & { children?: React.ReactNode };

/**
 * rehype-pretty-code wraps every fenced block in <figure> with an optional
 * <figcaption> (from title="...") and a <pre data-language>. Collapse that into one CodeBlock.
 */
function CodeFigure({ children, ...props }: ElementProps) {
  if (!("data-rehype-pretty-code-figure" in props)) return <figure {...props}>{children}</figure>;

  let title: React.ReactNode;
  let language: string | undefined;
  let pre: React.ReactNode = null;
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;
    const childProps = (child as ReactElement<ElementProps>).props;
    if ("data-rehype-pretty-code-title" in childProps) title = childProps.children;
    else {
      language = childProps["data-language"] as string | undefined;
      pre = child;
    }
  }
  return (
    <CodeBlock title={title} language={language}>
      {pre}
    </CodeBlock>
  );
}

// Every component chapters may use is registered here (MDX resolves <Name> through this map).
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 className="font-display text-4xl leading-tight sm:text-5xl" {...props} />,
    h2: (props) => <h2 className="mt-14 scroll-mt-24 font-display text-2xl leading-tight sm:text-3xl" {...props} />,
    h3: (props) => <h3 className="mt-9 scroll-mt-24 text-xl font-bold" {...props} />,
    p: (props) => <p className="mt-5 text-lg leading-8" {...props} />,
    ul: (props) => <ul className="mt-5 list-disc space-y-2 ps-6 text-lg leading-8 marker:text-accent" {...props} />,
    ol: (props) => <ol className="mt-5 list-decimal space-y-2 ps-6 text-lg leading-8 marker:text-accent" {...props} />,
    a: (props) => <a className="font-medium text-accent underline underline-offset-4" {...props} />,
    hr: () => <hr className="my-12 border-line" />,
    blockquote: (props) => <blockquote className="mt-5 border-s-4 border-accent ps-4 text-muted" {...props} />,
    table: (props) => (
      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="w-full border-collapse text-start text-base" {...props} />
      </div>
    ),
    th: (props) => <th className="border-b border-line bg-surface-2 px-4 py-2.5 text-start font-bold" {...props} />,
    td: (props) => <td className="border-b border-line px-4 py-2.5 align-top leading-7" {...props} />,
    figure: CodeFigure,
    // Inline code is always LTR and bidi-isolated inside Hebrew text.
    code: (props: ElementProps) =>
      "data-language" in props || "data-theme" in props ? (
        <code {...props} />
      ) : (
        <code dir="ltr" className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.88em] [overflow-wrap:anywhere]" {...props} />
      ),
    Callout,
    Challenges,
    CheatSheet,
    Checklist,
    Cmd,
    CodeBlock,
    CommandAnatomy,
    CronExplainer,
    Distro,
    DistroTabs,
    En,
    Exercise,
    Feedback,
    FinishProgress,
    Glossary,
    Kbd,
    MiniQuiz,
    PermissionCalculator,
    RecapCards,
    Resources,
    Solution,
    Steps,
    TerminalSimulator,
    TerminalWindow,
    ...components,
  };
}
