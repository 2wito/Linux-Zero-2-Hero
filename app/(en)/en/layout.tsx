import { RootShell } from "@/components/root-shell";
import { rootMetadata, siteViewport } from "@/lib/seo";

export const metadata = rootMetadata("en");

export const viewport = siteViewport;

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell locale="en">{children}</RootShell>;
}
