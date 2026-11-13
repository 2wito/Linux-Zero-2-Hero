import type { MetadataRoute } from "next";
import { themeColors } from "@/lib/seo";
import { ui } from "@/lib/ui";

// One manifest for both languages. It starts in Hebrew at "/"; English lives under the same scope (/en).
export default function manifest(): MetadataRoute.Manifest {
  const t = ui.he.meta;
  return {
    id: "/",
    name: t.homeTitle,
    short_name: t.siteName,
    description: t.description,
    lang: "he",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: themeColors.dark,
    theme_color: themeColors.dark,
    categories: ["education"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
