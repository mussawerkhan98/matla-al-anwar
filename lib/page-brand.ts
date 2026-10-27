/**
 * Brand settings for the designed service/industry pages and the admin page builder.
 * This is the only file that differs between sites using the same page builder.
 */
import { SITE, SITE_URL } from "./site";
import fallbackImage from "@/assets/fleet-lineup.jpg";

export const BRAND = {
  name: SITE.name,
  domain: SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  phone: SITE.phone,
  whatsapp: SITE.whatsapp,
  whatsappText: "Hello Matla Al Anwar, I need a chiller van quote.",
  tagline: SITE.tagline,
  fallbackImage,
  serviceBadge: "Cold-chain service",
  industryBadge: "Industry we serve",
  /** Three short trust points shown in the page header and quote box. */
  highlights: ["24/7 dispatch", "All 7 emirates", "Temperature-controlled"],
  areasNote: "24/7 cold-chain dispatch with same-day delivery across the emirates on request.",
  ctaText: "Tell us what you need delivered — we reply fast, 24/7, across all seven emirates.",
  industryQuoteTitle: (name: string) => `Chiller vans for ${name.toLowerCase()}`,
  industrySeoTitle: (name: string) => `${name} | Matla Al Anwar Chiller Van Transport`,
  /** Default "How It Works" steps used by the ready-made layout. */
  howItWorks: [
    { title: "Tell us what you need", text: "Share the cargo, temperature range, pickup and drop-off points and your timing by call, WhatsApp or the quote form." },
    { title: "Get a clear quote", text: "We recommend the right chiller or freezer vehicle and send a transparent price." },
    { title: "We dispatch", text: "A trained driver arrives on time with the van pre-cooled to your temperature." },
    { title: "Delivered fresh", text: "Your goods arrive at the right temperature, anywhere in the UAE." },
  ],
  /** Default "Why Choose" cards used by the ready-made layout. */
  whyChoose: [
    { title: "24/7 dispatch", text: "for urgent and out-of-hours deliveries" },
    { title: "All 7 emirates", text: "covered from one point of contact" },
    { title: "Temperature-controlled fleet", text: "for chilled and frozen goods" },
    { title: "Trained drivers", text: "who handle food and pharma with care" },
    { title: "Clear quotations", text: "with no hidden charges" },
  ],
  examples: {
    serviceTitle: "e.g. Frozen Food Delivery in Dubai and Across the UAE",
    serviceSlug: "frozen-food-delivery",
    serviceImageAlt: "e.g. Refrigerated van loading seafood, Dubai",
    serviceSeoTitle: "e.g. Frozen Food Delivery Dubai & UAE | Matla Al Anwar",
    industryName: "e.g. Bakeries & Confectionery",
    industrySlug: "bakeries-confectionery",
    industryImageAlt: "e.g. Chiller van delivering fresh produce to a supermarket, Dubai",
    sectionTitle: "Section title, e.g. Hire Options",
    linkExample: "/services/your-page",
  },
};
