// Site-wide constants. Values that the owner still has to provide are marked TODO.

export const SITE_NAME = "Linux Hebrew 0 to Hero";

export const AUTHOR = {
  he: { name: "איתי טויטו", bio: "סטודנט לתואר ראשון במדעי המחשב ב-HIT (מכון טכנולוגי חולון)" },
  en: { name: "Itay Twito", bio: "B.Sc. Computer Science student at HIT (Holon Institute of Technology)" },
};

// TODO: the owner will send the public feedback address. Until then the feedback button stays hidden.
export const FEEDBACK_EMAIL_PLACEHOLDER = "feedback@example.com";
export const FEEDBACK_EMAIL: string = FEEDBACK_EMAIL_PLACEHOLDER;
export const hasFeedbackEmail = () => FEEDBACK_EMAIL !== FEEDBACK_EMAIL_PLACEHOLDER;

/**
 * The public address, used for canonical URLs, the sitemap, social cards and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL once there's a custom domain. Until then, Vercel builds use the project's production
 * *.vercel.app address (VERCEL_PROJECT_PRODUCTION_URL, set by Vercel at build time), and local builds use localhost.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "");
