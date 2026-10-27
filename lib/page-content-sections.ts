/**
 * Known page/section combinations that page templates actually read.
 * Keeping this list in one place means the admin panel can offer a
 * safe dropdown instead of free-text fields that could typo and
 * silently stop rendering on the live page.
 */
export const KNOWN_SECTIONS = [
  {
    page_slug: "home",
    section_key: "why_us",
    label: "Home — \"Why Matla Al Anwar\" cards",
    fieldHints: { heading: "Card title", subheading: "(unused)", body: "Card description", icon: true },
  },
  {
    page_slug: "home",
    section_key: "testimonials",
    label: "Home — Testimonials",
    fieldHints: { heading: "Person's name", subheading: "Role / company", body: "Quote", icon: false },
  },
  {
    page_slug: "about",
    section_key: "about_values",
    label: "About — \"What we stand for\" cards",
    fieldHints: { heading: "Card title", subheading: "(unused)", body: "Card description", icon: true },
  },
] as const;

export function findSection(page_slug: string, section_key: string) {
  return KNOWN_SECTIONS.find((s) => s.page_slug === page_slug && s.section_key === section_key);
}
