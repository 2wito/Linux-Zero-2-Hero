"use client";

import { Info, Lightbulb, OctagonAlert, TriangleAlert } from "lucide-react";
import { useUi } from "@/components/use-locale";

const variants = {
  info: { icon: Info, box: "border-info/40 bg-info/[0.07]", icon_: "text-info" },
  tip: { icon: Lightbulb, box: "border-ok/40 bg-ok/[0.07]", icon_: "text-ok" },
  warning: { icon: TriangleAlert, box: "border-accent/45 bg-accent/[0.08]", icon_: "text-accent" },
  danger: { icon: OctagonAlert, box: "border-danger/50 bg-danger/[0.08]", icon_: "text-danger" },
};

export type CalloutType = keyof typeof variants;

/** Highlighted note. Each type has its own color, icon and a default title in the page's language. */
export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}) {
  const labels = useUi().callout;
  const v = variants[type] ?? variants.info;
  const Icon = v.icon;
  const heading = title ?? labels[type] ?? labels.info;

  return (
    <div role="note" className={`mt-6 flex gap-3 rounded-xl border p-4 ${v.box}`}>
      <Icon className={`mt-1 size-5 shrink-0 ${v.icon_}`} aria-hidden />
      <div className="min-w-0 flex-1 leading-7 [&>*:first-child]:mt-0 [&_li]:text-base [&_p]:mt-2 [&_p]:text-base [&_p]:leading-7">
        <p className="font-bold">{heading}</p>
        {children}
      </div>
    </div>
  );
}
