export const SITE_URL = "https://matlaalanwar.ae";

/**
 * Build an absolute, self-referencing canonical URL for a given path.
 * Strips any query string / hash and trailing slash (except for the
 * homepage, which canonicalizes to the bare domain root).
 */
export function canonicalUrl(path: string): string {
  const clean = path.split("?")[0].split("#")[0];
  if (clean === "/" || clean === "") return `${SITE_URL}/`;
  const noTrailingSlash = clean.endsWith("/") ? clean.slice(0, -1) : clean;
  return `${SITE_URL}${noTrailingSlash}`;
}

export const SITE = {
  name: "Matla Al Anwar Chiller Van Transport",
  shortName: "Matla Al Anwar",
  tagline: "Cold Trust. Safe Delivery.",
  description:
    "Premium refrigerated van & chiller truck transport across the UAE. Temperature-controlled cold-chain logistics for food, pharma, seafood, flowers and more.",
  email: "info@matlaalanwar.ae",
  phone: "+971 50 000 0000",
  phoneHref: "tel:+971500000000",
  whatsapp: "971500000000",
  whatsappHref: "https://wa.me/971500000000?text=Hello%20Matla%20Al%20Anwar%2C%20I%20need%20a%20chiller%20van%20quote.",
  address: "Dubai, United Arab Emirates",
  hours: "24 / 7 Cold-Chain Support",
};

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/fleet", label: "Fleet" },
  { to: "/services", label: "Services" },
  { to: "/industries", label: "Industries" },
  { to: "/locations", label: "Locations" },
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export type CitySlug =
  | "dubai"
  | "abu-dhabi"
  | "sharjah"
  | "ajman"
  | "ras-al-khaimah"
  | "fujairah"
  | "umm-al-quwain";

export interface City {
  slug: CitySlug;
  name: string;
  arabic: string;
  blurb: string;
  neighborhoods: string[];
  responseTime: string;
  /** Percentage coordinates on our 800×500 UAE SVG map */
  x: number;
  y: number;
}

export const CITIES: City[] = [
  {
    slug: "dubai",
    name: "Dubai",
    arabic: "دبي",
    blurb:
      "24/7 chiller van transport across Dubai — from Deira warehouses to Jebel Ali cold stores, hotels on Sheikh Zayed Road, and last-mile delivery to Downtown and Marina.",
    neighborhoods: [
      "Deira", "Bur Dubai", "Business Bay", "Downtown", "Marina", "JLT",
      "Al Quoz", "Jebel Ali", "DIP", "Silicon Oasis", "Dubai South",
    ],
    responseTime: "30–60 minutes",
    x: 55, y: 55,
  },
  {
    slug: "abu-dhabi",
    name: "Abu Dhabi",
    arabic: "أبو ظبي",
    blurb:
      "Refrigerated logistics for Abu Dhabi's hospitality, healthcare and government sectors. Daily runs across Yas Island, Mussafah, Khalifa City and the Corniche.",
    neighborhoods: ["Corniche", "Yas Island", "Mussafah", "Khalifa City", "Al Reem", "Saadiyat"],
    responseTime: "45–90 minutes",
    x: 35, y: 72,
  },
  {
    slug: "sharjah",
    name: "Sharjah",
    arabic: "الشارقة",
    blurb:
      "Fast chiller and freezer van service across Sharjah — Industrial Areas, Al Nahda, Al Majaz and Sharjah Free Zones with same-day cross-emirate delivery.",
    neighborhoods: ["Al Nahda", "Al Majaz", "Industrial Area", "Muweilah", "SAIF Zone"],
    responseTime: "30–60 minutes",
    x: 62, y: 50,
  },
  {
    slug: "ajman",
    name: "Ajman",
    arabic: "عجمان",
    blurb:
      "Reliable temperature-controlled transport across Ajman for restaurants, catering, seafood suppliers and pharmacies. Direct link to Sharjah and Dubai hubs.",
    neighborhoods: ["Al Nuaimiya", "Al Rashidiya", "Ajman Free Zone", "Al Jurf"],
    responseTime: "45–75 minutes",
    x: 66, y: 46,
  },
  {
    slug: "ras-al-khaimah",
    name: "Ras Al Khaimah",
    arabic: "رأس الخيمة",
    blurb:
      "Chiller van transport across RAK — resorts, dairy plants, fisheries and RAKEZ industrial customers. Long-haul routes to all seven emirates.",
    neighborhoods: ["Al Nakheel", "Al Hamra", "RAKEZ", "Al Marjan Island"],
    responseTime: "60–120 minutes",
    x: 76, y: 30,
  },
  {
    slug: "fujairah",
    name: "Fujairah",
    arabic: "الفجيرة",
    blurb:
      "East-coast cold-chain logistics for Fujairah — seafood from Dibba, hotels along the coast, and port cargo. Cross-mountain routes handled daily.",
    neighborhoods: ["Fujairah City", "Dibba", "Kalba border", "Fujairah Port"],
    responseTime: "90–150 minutes",
    x: 88, y: 42,
  },
  {
    slug: "umm-al-quwain",
    name: "Umm Al Quwain",
    arabic: "أم القيوين",
    blurb:
      "Refrigerated delivery across UAQ — from Old Town markets to UAQ Free Trade Zone and coastal restaurants. Scheduled and on-demand runs.",
    neighborhoods: ["UAQ Old Town", "UAQ Free Trade Zone", "Al Salamah"],
    responseTime: "60–90 minutes",
    x: 70, y: 40,
  },
];

export interface FleetVehicle {
  slug: string;
  name: string;
  category: string;
  capacity: string;
  tempRange: string;
  volume: string;
  ideal: string;
}

export const FLEET: FleetVehicle[] = [
  {
    slug: "toyota-hiace-chiller",
    name: "Toyota Hiace Chiller Van",
    category: "Compact Chiller",
    capacity: "1 Ton",
    tempRange: "+2°C to +8°C",
    volume: "6.5 m³",
    ideal: "City deliveries, catering, dairy, floral",
  },
  {
    slug: "nissan-urvan-chiller",
    name: "Nissan Urvan Chiller Van",
    category: "Compact Chiller",
    capacity: "1.2 Ton",
    tempRange: "+2°C to +8°C",
    volume: "7.2 m³",
    ideal: "Restaurant supply, pharmacy, medical",
  },
  {
    slug: "pickup-chiller",
    name: "1 Ton Pickup Chiller",
    category: "Pickup",
    capacity: "1 Ton",
    tempRange: "0°C to +8°C",
    volume: "5 m³",
    ideal: "Quick same-day runs, small loads",
  },
  {
    slug: "3-ton-chiller-truck",
    name: "3 Ton Chiller Truck",
    category: "Chiller Truck",
    capacity: "3 Tons",
    tempRange: "0°C to +10°C",
    volume: "16 m³",
    ideal: "Bulk supermarket, hotels, wholesale",
  },
  {
    slug: "5-ton-chiller-truck",
    name: "5 Ton Chiller Truck",
    category: "Chiller Truck",
    capacity: "5 Tons",
    tempRange: "0°C to +10°C",
    volume: "24 m³",
    ideal: "Cross-emirate bulk transport",
  },
  {
    slug: "freezer-truck",
    name: "Freezer Truck (Deep Freeze)",
    category: "Freezer",
    capacity: "3–7 Tons",
    tempRange: "−18°C to −25°C",
    volume: "16–28 m³",
    ideal: "Ice cream, frozen meat, seafood, pharma",
  },
];

export const SERVICES = [
  { title: "Food & Beverage Transport", desc: "Fresh produce, dairy, prepared meals and beverages moved at precise temperatures." },
  { title: "Frozen Food Logistics", desc: "Deep-freeze fleet from −18°C to −25°C for ice cream, ready meals and desserts." },
  { title: "Seafood & Meat Delivery", desc: "HACCP-aligned handling for fish, poultry and red meat from port to plate." },
  { title: "Pharmaceutical & Medical", desc: "Cold-chain integrity for medicines, vaccines, samples and lab supplies." },
  { title: "Chocolate & Confectionery", desc: "Gentle chilled transport that preserves texture, sheen and flavor." },
  { title: "Floral & Live Plants", desc: "Humidity-friendly chill zones for flowers, bouquets and event installations." },
  { title: "Hotels, Restaurants & Catering", desc: "Reliable daily supply routes for hospitality and F&B operators." },
  { title: "Supermarket Distribution", desc: "Scheduled multi-drop chilled and frozen distribution across the UAE." },
  { title: "Airport & Port Cargo", desc: "Time-critical cold cargo runs to DXB, DWC, AUH and Jebel Ali." },
];

export const INDUSTRIES = [
  "Restaurants", "Hotels & Resorts", "Hospitals & Medical",
  "Retail & Supermarkets", "Catering & Events", "Food Manufacturing",
  "Floral & Landscaping", "Ice Cream & Desserts", "Pharmaceutical",
];

export const STATS = [
  { value: "10+", label: "Years cold-chain expertise" },
  { value: "50k+", label: "Deliveries completed" },
  { value: "24/7", label: "Dispatch availability" },
  { value: "±0.5°C", label: "Temperature accuracy" },
];

export const FAQS = [
  {
    q: "What temperature ranges do you handle?",
    a: "Our chiller vans maintain +2°C to +8°C for fresh goods and pharmaceuticals, while our freezer trucks hold −18°C to −25°C for frozen and deep-freeze cargo. Every trip is logged with continuous temperature monitoring.",
  },
  {
    q: "Which emirates do you cover?",
    a: "We operate across all seven emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain — with dedicated local response teams and same-day cross-emirate runs.",
  },
  {
    q: "Do you offer monthly rental?",
    a: "Yes. We provide hourly, daily, weekly and monthly rental contracts with dedicated drivers, plus long-term dedicated-vehicle plans for restaurants, supermarkets and pharmaceutical clients.",
  },
  {
    q: "How fast can you dispatch?",
    a: "Standard dispatch within 30–60 minutes inside Dubai and Sharjah, 45–90 minutes for Abu Dhabi and 60–120 minutes for the northern emirates. Emergency and pre-booked slots are also available 24/7.",
  },
  {
    q: "Are your vehicles compliant with UAE regulations?",
    a: "All vehicles carry Dubai Municipality food-transport permits, follow HACCP-aligned cleaning protocols, and are fitted with calibrated temperature loggers for full traceability.",
  },
  {
    q: "Can you handle pharmaceutical shipments?",
    a: "Absolutely. We run GDP-aware routes for pharma, vaccines and clinical samples with pre-cooled vehicles, sealed transfers and temperature reports on delivery.",
  },
  {
    q: "How do I get a quote?",
    a: "Send us a WhatsApp message, call +971 50 000 0000, or use our contact form with pickup, drop-off, vehicle type and duration — we reply within minutes.",
  },
];
