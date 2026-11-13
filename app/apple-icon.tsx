import { brandIcon } from "@/lib/brand-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS home screen icon (full bleed: iOS rounds the corners itself).
export default async function AppleIcon() {
  return new Response(await brandIcon(size.width, true), { headers: { "Content-Type": contentType } });
}
