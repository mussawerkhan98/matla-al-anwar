/**
 * Brand settings for the designed service/industry pages and the admin page builder.
 * This is the only file that differs between sites using the same page builder.
 */
import { SITE, SITE_URL } from "./site";
import fallbackImage from "@/assets/finished-room.jpg";

export const BRAND = {
  name: SITE.name,
  domain: SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  phone: SITE.phone,
  whatsapp: SITE.whatsapp,
  whatsappText: SITE.whatsappText,
  tagline: SITE.tagline,
  fallbackImage,
  serviceBadge: "Our service",
  industryBadge: "Who we serve",
  /** Three short trust points shown in the page header and quote box. */
  highlights: ["Free inspection", "All 7 emirates", "Same-day slots"],
  areasNote: "Same-day painting touch-ups and sofa cleaning in Dubai, Sharjah and Ajman; scheduled visits in all other emirates.",
  ctaText: "Send us a few photos on WhatsApp — we reply fast with a clear, fixed price.",
  industryQuoteTitle: (name: string) => `Painting & sofa cleaning for ${name.toLowerCase()}`,
  industrySeoTitle: (name: string) => `Painting & Sofa Cleaning for ${name} UAE | Matla Al Anwar`,
  /** Default "How It Works" steps used by the ready-made layout. */
  howItWorks: [
    { title: "Send photos or call", text: "Share the rooms, sofa size or area you need done by WhatsApp, phone or the quote form." },
    { title: "Get a fixed price", text: "We send a clear quote, or visit for a free inspection on bigger painting jobs." },
    { title: "We do the work", text: "Our uniformed team arrives on time, covers furniture and floors, and gets to work." },
    { title: "Clean handover", text: "We tidy up, walk you through the finish and only leave when you're happy." },
  ],
  /** Default "Why Choose" cards used by the ready-made layout. */
  whyChoose: [
    { title: "Fixed, transparent prices", text: "no hidden charges after the quote" },
    { title: "Trained, uniformed team", text: "painters and cleaners who respect your home" },
    { title: "Premium materials", text: "Jotun, National Paints, Dulux and safe cleaning solutions" },
    { title: "Furniture & floor protection", text: "everything covered before we start" },
    { title: "All 7 emirates", text: "covered from one point of contact" },
  ],
  examples: {
    serviceTitle: "e.g. Villa Painting in Dubai and Across the UAE",
    serviceSlug: "villa-painting",
    serviceImageAlt: "e.g. Painter rolling a fresh coat on a living-room wall, Dubai",
    serviceSeoTitle: "e.g. Villa Painting Dubai | Matla Al Anwar",
    industryName: "e.g. Holiday Homes",
    industrySlug: "holiday-homes",
    industryImageAlt: "e.g. Freshly cleaned sofa in a holiday-home living room",
    sectionTitle: "Section title, e.g. Paint Finishes",
    linkExample: "/services/your-page",
  },
};
