import { ImageResponse } from "next/og";

// PNG versions of app/icon.svg (an amber prompt and a green cursor on the terminal background),
// for the web app manifest and the iOS home screen.
const BG = "#16120c";
const PROMPT = "#f5b041";
const CURSOR = "#5fd68a";

/**
 * `fullBleed` fills the whole square and keeps the mark inside the central safe zone, for maskable icons
 * (Android crops them to a circle) and apple-touch-icon (iOS rounds the corners itself).
 */
export async function brandIcon(size: number, fullBleed = false): Promise<ArrayBuffer> {
  const mark = fullBleed ? Math.round(size * 0.7) : size;
  const response = new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: fullBleed ? BG : "transparent",
        }}
      >
        <svg width={mark} height={mark} viewBox="0 0 32 32">
          {!fullBleed && <rect width="32" height="32" rx="7" fill={BG} />}
          <path d="M8 11l5 5-5 5" fill="none" stroke={PROMPT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 22h8" stroke={CURSOR} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
  return response.arrayBuffer();
}
