import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

/** Apenas rotas públicas e indexáveis: áreas autenticadas ficam fora. */
const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/privacidade", changefreq: "yearly", priority: "0.3" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }: { request: Request }) => {
        // Usa a origem da requisição para que o sitemap sempre reflita o domínio
        // realmente acessado (inclusive um domínio próprio), sem URLs fixas.
        const baseUrl = new URL(request.url).origin;
        const urls = entries.map((entrada) =>
          [
            `  <url>`,
            `    <loc>${baseUrl}${entrada.path}</loc>`,
            entrada.changefreq ? `    <changefreq>${entrada.changefreq}</changefreq>` : null,
            entrada.priority ? `    <priority>${entrada.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
