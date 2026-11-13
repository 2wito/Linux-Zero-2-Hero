import { IBM_Plex_Mono, IBM_Plex_Sans_Hebrew, Secular_One } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { bootScript, dir, type Locale } from "@/lib/i18n";
import { ui } from "@/lib/ui";
import "@/app/globals.css";

const plex = IBM_Plex_Sans_Hebrew({
  variable: "--font-plex",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
});

const secular = Secular_One({
  variable: "--font-secular",
  subsets: ["hebrew", "latin"],
  weight: "400",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

/**
 * The <html> document for one language. Hebrew and English are separate root layouts,
 * so the server-rendered lang/dir is right for search engines and before any script runs.
 */
export function RootShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html lang={locale} dir={dir(locale)} suppressHydrationWarning>
      {/* A raw <head> is the App Router way to inline a pre-paint script (restores the saved font size). */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className={`${plex.variable} ${secular.variable} ${plexMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5 focus:font-medium focus:text-accent-ink"
          >
            {ui[locale].a11y.skip}
          </a>
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
