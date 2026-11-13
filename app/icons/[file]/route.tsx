import { notFound } from "next/navigation";
import { brandIcon } from "@/lib/brand-icon";
import { pngResponse } from "@/lib/og";

// PNG icons for the web app manifest, rendered once at build time.
const icons: Record<string, { size: number; fullBleed: boolean }> = {
  "icon-192.png": { size: 192, fullBleed: false },
  "icon-512.png": { size: 512, fullBleed: false },
  "maskable-512.png": { size: 512, fullBleed: true },
};

export function generateStaticParams() {
  return Object.keys(icons).map((file) => ({ file }));
}

async function icon(file: string) {
  "use cache";
  const { size, fullBleed } = icons[file];
  return brandIcon(size, fullBleed);
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!icons[file]) notFound();
  return pngResponse(await icon(file));
}
