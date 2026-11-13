import { ImageResponse } from "next/og";
import type { Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { ui } from "@/lib/ui";

// Social cards (1200×630), rendered once at build time by app/og/... routes. Modeled on the reference lib/og.tsx,
// in this site's amber terminal palette (dark tokens from globals.css).

export const ogSize = { width: 1200, height: 630 };

const colors = { bg: "#12100c", term: "#0b0907", ink: "#efe8dc", muted: "#b3a690", accent: "#f5b041", ok: "#5fd68a", line: "#352e23" };

/**
 * The image renderer has no bidi support and lays Hebrew out left to right, so each Hebrew line is reversed here
 * to come out in the right visual order. Latin words and numbers inside it ("Docker", "0", "Hero") are flipped back
 * so they still read left to right. Lines can't wrap (a wrapped reversed line would swap its halves).
 */
export function visual(s: string, locale: Locale) {
  if (locale !== "he") return s;
  return [...s]
    .reverse()
    .join("")
    .replace(/[A-Za-z0-9](?:[A-Za-z0-9 .,'&+/-]*[A-Za-z0-9])?/g, (run) => [...run].reverse().join(""));
}

/** Fetches only the glyphs a card uses from Google Fonts, as TTF (the renderer can't read woff2). Build time only. */
async function googleFont(family: string, chars: string) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(chars)}`)).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`Could not load font ${family}`);
  return (await fetch(url)).arrayBuffer();
}

export type OgChapter = { label: string; title: string };

/** The site card (no chapter) or a chapter card, as PNG bytes. */
export async function renderOgImage(locale: Locale, chapter?: OgChapter): Promise<ArrayBuffer> {
  const t = ui[locale].meta;
  const domain = new URL(SITE_URL).host;
  const prompt = "$ cd ~/linux";
  const brand = "Linux Hebrew 0 to Hero";
  const display = `${brand}${t.ogTagline}${chapter?.title ?? ""}`;
  const body = `${prompt}${t.ogSub}${domain}${t.siteName}${chapter?.label ?? ""}`;
  const titleSize = chapter ? Math.min(92, Math.floor(1900 / chapter.title.length)) : 0;
  const align = locale === "he" ? "flex-end" : "flex-start";

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: align,
          padding: "64px 80px",
          background: colors.bg,
          color: colors.ink,
          fontFamily: "Plex",
          borderBottom: `12px solid ${colors.accent}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 22px",
            borderRadius: 16,
            background: colors.term,
            border: `2px solid ${colors.line}`,
            fontSize: 30,
          }}
        >
          <div style={{ width: 16, height: 16, borderRadius: 8, background: "#ff5f57" }} />
          <div style={{ width: 16, height: 16, borderRadius: 8, background: "#febc2e" }} />
          <div style={{ width: 16, height: 16, borderRadius: 8, background: "#28c840", marginRight: 10 }} />
          <span style={{ color: colors.ok }}>{prompt}</span>
        </div>
        {chapter ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: align }}>
            <div style={{ fontSize: 42, color: colors.accent, whiteSpace: "nowrap" }}>{visual(chapter.label, locale)}</div>
            <div style={{ fontFamily: "Secular", fontSize: titleSize, lineHeight: 1.15, marginTop: 16, whiteSpace: "nowrap" }}>
              {visual(chapter.title, locale)}
            </div>
            <div style={{ fontSize: 36, color: colors.muted, marginTop: 24, whiteSpace: "nowrap" }}>{visual(t.siteName, locale)}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: align }}>
            <div style={{ fontFamily: "Secular", fontSize: 84, lineHeight: 1, whiteSpace: "nowrap" }}>{brand}</div>
            <div style={{ fontFamily: "Secular", fontSize: 72, color: colors.accent, marginTop: 20, whiteSpace: "nowrap" }}>
              {visual(t.ogTagline, locale)}
            </div>
            <div style={{ fontSize: 36, color: colors.muted, marginTop: 22, whiteSpace: "nowrap" }}>{visual(t.ogSub, locale)}</div>
          </div>
        )}
        <div style={{ display: "flex", fontSize: 28, color: colors.muted }}>{domain}</div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Secular", data: await googleFont("Secular+One", display), weight: 400 },
        { name: "Plex", data: await googleFont("IBM+Plex+Sans+Hebrew:wght@500", body), weight: 500 },
      ],
    },
  );
  return response.arrayBuffer();
}

export const pngResponse = (bytes: ArrayBuffer) => new Response(bytes, { headers: { "Content-Type": "image/png" } });
