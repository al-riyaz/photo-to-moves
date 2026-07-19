// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://cubesolver.trend2print.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/guide", changefreq: "monthly", priority: "0.8" },
  { path: "/guide/2x2", changefreq: "monthly", priority: "0.7" },
  { path: "/guide/4x4", changefreq: "monthly", priority: "0.7" },
  { path: "/guide/pyraminx", changefreq: "monthly", priority: "0.7" },
  { path: "/notation", changefreq: "monthly", priority: "0.7" },
  { path: "/patterns", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/blog", changefreq: "weekly", priority: "0.6" },
  { path: "/blog/speedcubing-tips-for-beginners", changefreq: "monthly", priority: "0.6" },
  { path: "/blog/how-a-cube-solver-works", changefreq: "monthly", priority: "0.6" },
  { path: "/blog/best-cubes-for-beginners", changefreq: "monthly", priority: "0.6" },
  { path: "/seo-status", changefreq: "monthly", priority: "0.3" },
];

function generateSitemap(items: SitemapEntry[]) {
  const urls = items.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
