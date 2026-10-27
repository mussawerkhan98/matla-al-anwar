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
  name: "Matla Al Anwar",
  legalName: "Matla Al Anwar Painting & Cleaning Services",
  shortName: "Matla Al Anwar",
  tagline: "Fresh walls. Spotless sofas.",
  description:
    "Professional house painting and sofa cleaning across the UAE. Interior & exterior painting, villa and apartment repainting, and deep sofa, upholstery and mattress cleaning — free inspection, same-day service.",
  email: "info@matlaalanwar.ae",
  phone: "+971 50 000 0000",
  phoneHref: "tel:+971500000000",
  whatsapp: "971500000000",
  whatsappHref: "https://wa.me/971500000000?text=Hello%20Matla%20Al%20Anwar%2C%20I%20need%20a%20quote.",
  whatsappText: "Hello Matla Al Anwar, I need a quote.",
  address: "Dubai, United Arab Emirates",
  hours: "Open 7 days · 8am – 10pm",
};

/** Build a WhatsApp link with the standard enquiry text. */
export function whatsappLink(number: string, text: string = SITE.whatsappText): string {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;
}

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/pricing", label: "Pricing" },
  { to: "/industries", label: "Who We Serve" },
  { to: "/locations", label: "Areas" },
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
      "Apartment, villa and office painting plus sofa and upholstery cleaning across Dubai — from Marina and JVC towers to Mirdif, Arabian Ranches and Downtown.",
    neighborhoods: [
      "Dubai Marina", "JLT", "JVC", "Downtown", "Business Bay", "Al Barsha",
      "Mirdif", "Arabian Ranches", "Palm Jumeirah", "Silicon Oasis", "Deira", "Bur Dubai",
    ],
    responseTime: "Same day",
    x: 55, y: 55,
  },
  {
    slug: "abu-dhabi",
    name: "Abu Dhabi",
    arabic: "أبو ظبي",
    blurb:
      "Interior and exterior painting and deep sofa cleaning for homes and offices in Abu Dhabi — Khalifa City, Al Reem, Yas Island, Saadiyat and Mohammed Bin Zayed City.",
    neighborhoods: ["Khalifa City", "Al Reem Island", "Yas Island", "Saadiyat", "MBZ City", "Al Raha", "Corniche"],
    responseTime: "Next day",
    x: 35, y: 72,
  },
  {
    slug: "sharjah",
    name: "Sharjah",
    arabic: "الشارقة",
    blurb:
      "Affordable flat and villa painting and sofa shampooing in Sharjah — Al Nahda, Al Majaz, Al Khan, Muwaileh and Aljada, with same-day slots.",
    neighborhoods: ["Al Nahda", "Al Majaz", "Al Khan", "Al Taawun", "Muwaileh", "Aljada"],
    responseTime: "Same day",
    x: 62, y: 50,
  },
  {
    slug: "ajman",
    name: "Ajman",
    arabic: "عجمان",
    blurb:
      "Wall painting, move-out repainting and fabric sofa cleaning for apartments and villas in Ajman — Al Nuaimiya, Al Rashidiya, Al Jurf and Emirates City.",
    neighborhoods: ["Al Nuaimiya", "Al Rashidiya", "Al Jurf", "Al Rawda", "Emirates City"],
    responseTime: "Same day",
    x: 66, y: 46,
  },
  {
    slug: "ras-al-khaimah",
    name: "Ras Al Khaimah",
    arabic: "رأس الخيمة",
    blurb:
      "Villa repainting, exterior weather-shield coatings and sofa and carpet cleaning in Ras Al Khaimah — Al Hamra, Mina Al Arab, Al Nakheel and Al Marjan Island.",
    neighborhoods: ["Al Hamra", "Mina Al Arab", "Al Nakheel", "Al Marjan Island", "Khuzam"],
    responseTime: "Next day",
    x: 76, y: 30,
  },
  {
    slug: "fujairah",
    name: "Fujairah",
    arabic: "الفجيرة",
    blurb:
      "Painting and upholstery cleaning on the east coast — Fujairah City, Dibba and Kalba homes, holiday villas and hotels, booked on scheduled visit days.",
    neighborhoods: ["Fujairah City", "Dibba", "Kalba", "Al Faseel", "Merashid"],
    responseTime: "Scheduled",
    x: 88, y: 42,
  },
  {
    slug: "umm-al-quwain",
    name: "Umm Al Quwain",
    arabic: "أم القيوين",
    blurb:
      "Apartment and villa painting plus sofa, mattress and curtain cleaning in Umm Al Quwain — Al Salamah, Al Raas, UAQ Marina and the Old Town.",
    neighborhoods: ["Al Salamah", "Al Raas", "UAQ Marina", "Old Town", "Al Humrah"],
    responseTime: "Next day",
    x: 70, y: 40,
  },
];

/** Price packages (stored in the `fleet_vehicles` table, shown on /pricing). */
export interface PricePackage {
  slug: string;
  name: string;
  /** Painting / Sofa Cleaning */
  category: string;
  /** Size / quantity covered, e.g. "1 bedroom apartment" */
  capacity: string;
  /** Duration, e.g. "1 day" */
  duration: string;
  /** What's included */
  includes: string;
  ideal: string;
  startingPrice: number;
}

export const PACKAGES: PricePackage[] = [
  { slug: "studio-painting", name: "Studio Apartment Painting", category: "Painting", capacity: "Studio", duration: "1 day", includes: "Walls & ceilings, 2 coats, minor crack filling", ideal: "Move-in / move-out repaint", startingPrice: 650 },
  { slug: "1br-painting", name: "1 Bedroom Apartment Painting", category: "Painting", capacity: "1 BHK", duration: "1–2 days", includes: "Walls & ceilings, 2 coats, furniture covering", ideal: "Tenants and landlords", startingPrice: 950 },
  { slug: "2br-painting", name: "2 Bedroom Apartment Painting", category: "Painting", capacity: "2 BHK", duration: "2 days", includes: "Walls & ceilings, 2 coats, putty patching", ideal: "Families and handovers", startingPrice: 1400 },
  { slug: "villa-painting", name: "Villa Painting", category: "Painting", capacity: "3–5 bedroom villa", duration: "3–6 days", includes: "Interior, optional exterior, doors & trims", ideal: "Full home refresh", startingPrice: 3500 },
  { slug: "sofa-3-seater", name: "3-Seater Sofa Deep Clean", category: "Sofa Cleaning", capacity: "3 seats", duration: "1–2 hours", includes: "Vacuum, stain treatment, shampoo & hot-water extraction", ideal: "Fabric sofas", startingPrice: 149 },
  { slug: "sofa-l-shape", name: "L-Shape / 5–7 Seater Sofa", category: "Sofa Cleaning", capacity: "5–7 seats", duration: "2–3 hours", includes: "Deep shampoo, sanitising, deodorising, fast dry", ideal: "Family living rooms", startingPrice: 249 },
  { slug: "majlis-cleaning", name: "Majlis Cleaning", category: "Sofa Cleaning", capacity: "Per metre", duration: "2–4 hours", includes: "Floor cushions, back rests & carpets", ideal: "Majlis and guest rooms", startingPrice: 35 },
  { slug: "mattress-cleaning", name: "Mattress Cleaning", category: "Sofa Cleaning", capacity: "Single / Queen / King", duration: "45 minutes", includes: "Dust-mite removal, stain treatment, sanitising", ideal: "Allergy sufferers", startingPrice: 99 },
];

export const SERVICES = [
  { slug: "interior-painting", title: "Interior Painting", desc: "Walls, ceilings, doors and trims painted with premium low-odour paints and a clean, sharp finish." },
  { slug: "exterior-painting", title: "Exterior & Villa Painting", desc: "Weather-resistant coatings for villa facades, boundary walls and gates that stand up to UAE sun and humidity." },
  { slug: "apartment-painting", title: "Apartment Move-In / Move-Out Painting", desc: "Fast repainting to get your deposit back or make a new home feel fresh — usually done in 1–2 days." },
  { slug: "sofa-cleaning", title: "Sofa Cleaning", desc: "Deep shampoo and hot-water extraction that lifts stains, odours and dust mites from fabric sofas." },
  { slug: "upholstery-mattress-cleaning", title: "Upholstery & Mattress Cleaning", desc: "Dining chairs, headboards, mattresses and cushions sanitised and refreshed at your home." },
  { slug: "majlis-carpet-cleaning", title: "Majlis & Carpet Cleaning", desc: "Majlis seating, rugs and carpets cleaned on-site with fast-dry equipment." },
];

export const INDUSTRIES = [
  "Apartments", "Villas", "Offices", "Landlords & Property Managers",
  "Restaurants & Cafés", "Hotels & Holiday Homes", "Schools & Nurseries", "Clinics", "Retail Shops",
];

export const STATS = [
  { value: "1,500+", label: "Homes painted & cleaned" },
  { value: "7", label: "Emirates covered" },
  { value: "Same day", label: "Sofa cleaning slots" },
  { value: "Free", label: "Site inspection & quote" },
];

export const FAQS = [
  {
    q: "How much does it cost to paint an apartment in Dubai?",
    a: "Our apartment painting starts from AED 650 for a studio, AED 950 for a 1-bedroom and AED 1,400 for a 2-bedroom, including walls, ceilings, two coats of paint and furniture covering. Villas start from AED 3,500. We confirm a fixed price after a free inspection.",
  },
  {
    q: "How much is sofa cleaning?",
    a: "Sofa cleaning starts from AED 149 for a 3-seater and AED 249 for an L-shape or 5–7 seater sofa. Majlis cleaning is priced per metre and mattresses start from AED 99.",
  },
  {
    q: "Which areas do you cover?",
    a: "We work across all seven emirates — Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain. Dubai, Sharjah and Ajman usually get same-day slots.",
  },
  {
    q: "How long does painting take, and can we stay at home?",
    a: "A studio or 1-bedroom is usually finished in 1–2 days and a villa in 3–6 days. We use low-odour, quick-drying paints and cover all furniture and floors, so most families stay at home while we work.",
  },
  {
    q: "How long does a sofa take to dry after cleaning?",
    a: "With our hot-water extraction machines most fabric sofas are dry in 3–6 hours. Opening windows or running the AC speeds it up.",
  },
  {
    q: "Which paint brands do you use?",
    a: "We use trusted brands such as Jotun, National Paints and Dulux. You can choose the brand, finish (matt, silk or gloss) and colour, and we can bring colour charts to your home.",
  },
  {
    q: "How do I get a quote?",
    a: "Send us photos on WhatsApp, call +971 50 000 0000, or fill in the contact form. We reply quickly with a price, or book a free site inspection for bigger jobs.",
  },
];
