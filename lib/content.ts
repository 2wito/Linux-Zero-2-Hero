import type { ComponentType } from "react";
import type { Locale } from "@/lib/i18n";

type MDXModule = { default: ComponentType };
type ContentMap = Record<string, () => Promise<MDXModule>>;

// Chapter content per language. A chapter missing from a map renders a "being written" placeholder.
// Static import paths (not template strings) so the bundler only includes files that exist.
export const chapterContent: Record<Locale, ContentMap> = {
  he: {
    "01-what-is-linux": () => import("@/content/docs/01-what-is-linux.mdx"),
    "02-distros": () => import("@/content/docs/02-distros.mdx"),
    "03-getting-linux": () => import("@/content/docs/03-getting-linux.mdx"),
    "04-first-terminal-steps": () => import("@/content/docs/04-first-terminal-steps.mdx"),
    "05-filesystem-navigation": () => import("@/content/docs/05-filesystem-navigation.mdx"),
    "06-files-and-directories": () => import("@/content/docs/06-files-and-directories.mdx"),
    "07-viewing-editing": () => import("@/content/docs/07-viewing-editing.mdx"),
    "08-getting-help": () => import("@/content/docs/08-getting-help.mdx"),
    "09-users-permissions": () => import("@/content/docs/09-users-permissions.mdx"),
    "10-package-management": () => import("@/content/docs/10-package-management.mdx"),
    "11-processes-jobs": () => import("@/content/docs/11-processes-jobs.mdx"),
    "12-pipes-redirection": () => import("@/content/docs/12-pipes-redirection.mdx"),
    "13-text-tools": () => import("@/content/docs/13-text-tools.mdx"),
    "14-finding-things": () => import("@/content/docs/14-finding-things.mdx"),
    "15-environment-shell": () => import("@/content/docs/15-environment-shell.mdx"),
    "16-networking-basics": () => import("@/content/docs/16-networking-basics.mdx"),
    "17-archives-compression": () => import("@/content/docs/17-archives-compression.mdx"),
    "18-bash-scripting": () => import("@/content/docs/18-bash-scripting.mdx"),
    "19-cron-systemd": () => import("@/content/docs/19-cron-systemd.mdx"),
    "20-logs": () => import("@/content/docs/20-logs.mdx"),
    "21-disks-storage": () => import("@/content/docs/21-disks-storage.mdx"),
    "22-security-basics": () => import("@/content/docs/22-security-basics.mdx"),
    "23-git-basics": () => import("@/content/docs/23-git-basics.mdx"),
    "24-docker-intro": () => import("@/content/docs/24-docker-intro.mdx"),
    "25-performance-troubleshooting": () => import("@/content/docs/25-performance-troubleshooting.mdx"),
    "26-cheat-sheet": () => import("@/content/docs/26-cheat-sheet.mdx"),
    "27-glossary": () => import("@/content/docs/27-glossary.mdx"),
    "29-resources": () => import("@/content/docs/29-resources.mdx"),
  },
  en: {
    "26-cheat-sheet": () => import("@/content/docs-en/26-cheat-sheet.mdx"),
    "27-glossary": () => import("@/content/docs-en/27-glossary.mdx"),
    "29-resources": () => import("@/content/docs-en/29-resources.mdx"),
  },
};
