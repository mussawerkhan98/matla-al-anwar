/**
 * Pages a FAQ can be shown on. Stored on each faq row as a comma-separated
 * string (matching the pattern used for locations.neighborhoods) rather
 * than a Postgres array, so no special array-column handling is needed.
 */
export const FAQ_PAGE_OPTIONS = [
  { slug: "home", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "fleet", label: "Fleet" },
  { slug: "services", label: "Services" },
  { slug: "industries", label: "Industries" },
  { slug: "locations", label: "Locations" },
  { slug: "contact", label: "Contact" },
  { slug: "blog", label: "Blog" },
  { slug: "faq", label: "FAQ page (full list)" },
] as const;

export function pagesToArray(pages: string): string[] {
  return pages
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

export function arrayToPages(pages: string[]): string {
  return pages.join(",");
}
