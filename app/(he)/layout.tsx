import { RootShell } from "@/components/root-shell";
import { rootMetadata, siteViewport } from "@/lib/seo";

export const metadata = rootMetadata("he");

export const viewport = siteViewport;

export default function HebrewRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell locale="he">{children}</RootShell>;
}
