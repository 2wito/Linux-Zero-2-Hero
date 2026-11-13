import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// Chapters live in content/docs (he) and content/docs-en (en) and are imported by the docs routes,
// so MDX doesn't need to be a page extension.
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Plugins are referenced by name (not imported) so the options stay serializable for Turbopack.
const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-gfm", {}]],
    rehypePlugins: [["rehype-slug", {}], ["rehype-pretty-code", { theme: "github-dark", keepBackground: false }]],
  },
});

export default withMDX(nextConfig);
