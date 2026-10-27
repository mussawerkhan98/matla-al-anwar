import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import {
  PaintRoller,
  Sofa,
  Sparkles,
  Shield,
  Clock,
  BadgeCheck,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  Star,
  Camera,
  CalendarCheck,
  ThumbsUp,
} from "lucide-react";
import { SITE, STATS, canonicalUrl, whatsappLink } from "@/lib/site";
import { listFleetPublic } from "@/lib/fleet.functions";
import { listServicesPublic } from "@/lib/services.functions";
import { listFaqsPublic } from "@/lib/faqs.functions";
import { listIndustriesPublic } from "@/lib/industries.functions";
import { siteImagesQuery, pickImage } from "@/lib/site-images.query";
import { settingsQuery, getSetting } from "@/lib/settings.query";
import { locationsQuery } from "@/lib/locations.query";
import { pageContentQuery, contentForSection } from "@/lib/page-content.query";
import { getIcon } from "@/lib/icon-map";
import { FaqSection } from "@/components/FaqSection";
import { UAEMap } from "@/components/UAEMap";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import heroImg from "@/assets/hero-painting.jpg";
import sofaImg from "@/assets/sofa-cleaning.jpg";
import roomImg from "@/assets/finished-room.jpg";

const packagesQuery = () =>
  queryOptions({ queryKey: ["fleet", "list"], queryFn: () => listFleetPublic() });
const servicesQuery = () =>
  queryOptions({ queryKey: ["services", "list"], queryFn: () => listServicesPublic() });
const faqsQuery = () =>
  queryOptions({ queryKey: ["faqs", "list", "home"], queryFn: () => listFaqsPublic({ data: { page: "home" } }) });
const industriesQuery = () =>
  queryOptions({ queryKey: ["industries", "list"], queryFn: () => listIndustriesPublic() });

type SiteImages = Awaited<ReturnType<typeof import("@/lib/images.functions").listSiteImagesPublic>>;
type Settings = Record<string, string | null>;

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [packages, services, faqs, images, settings] = await Promise.all([
      context.queryClient.ensureQueryData(packagesQuery()),
      context.queryClient.ensureQueryData(servicesQuery()),
      context.queryClient.ensureQueryData(faqsQuery()),
      context.queryClient.ensureQueryData(siteImagesQuery()),
      context.queryClient.ensureQueryData(settingsQuery()),
      context.queryClient.ensureQueryData(industriesQuery()),
      context.queryClient.ensureQueryData(locationsQuery()),
      context.queryClient.ensureQueryData(pageContentQuery("home")),
    ]);
    return { packages, services, faqs, images, settings };
  },
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    const faqs = loaderData?.faqs ?? [];
    const title = getSetting(
      settings,
      "meta_home_title",
      "Painting & Sofa Cleaning Services in Dubai & UAE | Matla Al Anwar",
    );
    const description = getSetting(
      settings,
      "meta_home_description",
      "Professional house painting and sofa cleaning in Dubai, Sharjah, Abu Dhabi & all UAE. Apartment & villa painting from AED 650, sofa deep cleaning from AED 149. Free inspection — call or WhatsApp.",
    );
    const scripts = [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Matla Al Anwar services",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Painting services", url: canonicalUrl("/services/interior-painting") },
            { "@type": "ListItem", position: 2, name: "Sofa cleaning", url: canonicalUrl("/services/sofa-cleaning") },
          ],
        }),
      },
    ];
    if (faqs.length > 0) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.slice(0, 5).map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      });
    }
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonicalUrl("/") },
      ],
      links: [{ rel: "canonical", href: canonicalUrl("/") }],
      scripts,
    };
  },
  component: Home,
});

function Home() {
  const { data: packages } = useSuspenseQuery(packagesQuery());
  const { data: services } = useSuspenseQuery(servicesQuery());
  const { data: faqs } = useSuspenseQuery(faqsQuery());
  const { data: images } = useSuspenseQuery(siteImagesQuery());
  const { data: settings } = useSuspenseQuery(settingsQuery());

  return (
    <>
      <Hero images={images} settings={settings} />
      <StatsBar />
      <CoreServices images={images} settings={settings} />
      <ServicesSection services={services} settings={settings} />
      <PricingPreview packages={packages} settings={settings} />
      <HowItWorks />
      <WhyUs images={images} settings={settings} />
      <IndustriesStrip />
      <CoverageSection settings={settings} />
      <TestimonialsSection settings={settings} />
      <FaqSection
        faqs={faqs}
        desc="Prices, timings, paint brands and drying times — the questions we hear most."
        limit={5}
      />
      <CTASection settings={settings} />
    </>
  );
}

function useContact(settings: Settings) {
  const phone = getSetting(settings, "site_phone", SITE.phone);
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const whatsapp = getSetting(settings, "site_whatsapp", SITE.whatsapp);
  return { phone, phoneHref, whatsappHref: whatsappLink(whatsapp) };
}

function Hero({ images, settings }: { images: SiteImages; settings: Settings }) {
  const hero = pickImage(images, "home_hero", {
    src: heroImg,
    alt: "Living room wall being freshly painted with a roller, ladder and paint bucket",
  });
  const { phone, phoneHref, whatsappHref } = useContact(settings);

  const isDark = getSetting(settings, "hero_text_theme", "light") === "dark";
  const badgeText = getSetting(settings, "hero_badge_text", "Painting & sofa cleaning · All 7 emirates");
  const title = getSetting(settings, "hero_title", "Fresh walls. Spotless sofas. One trusted team.");
  const subtitle = getSetting(
    settings,
    "hero_subtitle",
    `${SITE.name} paints apartments, villas and offices and deep-cleans sofas, majlis and mattresses across the UAE — with fixed prices, premium materials and a careful, uniformed team.`,
  );

  const textCls = isDark ? "text-navy" : "text-white";
  const subtitleCls = isDark ? "text-navy/80" : "text-white/85";
  const badgeCls = isDark
    ? "bg-navy/5 backdrop-blur-md border border-navy/15 text-navy"
    : "bg-white/10 backdrop-blur-md border border-white/20 text-white";
  const checklistCls = isDark ? "text-navy/80" : "text-white/90";

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={hero.src}
          alt={hero.alt}
          width={1600}
          height={1000}
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: isDark ? "var(--gradient-hero-light)" : "var(--gradient-hero)" }}
        />
      </div>
      <div className="container-page relative pt-20 pb-28 lg:pt-32 lg:pb-40">
        <div className="max-w-3xl animate-fade-up">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider ${badgeCls}`}>
            <Sparkles className="h-3.5 w-3.5 text-warm" />
            {badgeText}
          </div>
          <h1 className={`mt-6 font-display text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight ${textCls}`}>
            {title}
          </h1>
          <p className={`mt-6 max-w-2xl text-lg leading-relaxed ${subtitleCls}`}>{subtitle}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full gradient-brand text-white px-7 py-3.5 text-sm font-semibold shadow-elegant hover-lift"
            >
              Get a Free Quote <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-6 py-3.5 text-sm font-semibold hover:brightness-110 transition"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp Photos
            </a>
            <a
              href={phoneHref}
              className="inline-flex items-center gap-2 rounded-full bg-white text-navy px-6 py-3.5 text-sm font-semibold hover:bg-ice transition-colors"
            >
              <Phone className="h-4 w-4" /> {phone}
            </a>
          </div>

          <ul className={`mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 max-w-2xl text-sm ${checklistCls}`}>
            {["Free inspection", "Fixed prices", "Jotun & Dulux paints", "Same-day sofa cleaning"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="relative -mt-14 z-10 container-page">
      <div className="rounded-3xl bg-white shadow-elegant border border-border grid grid-cols-2 md:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`p-6 sm:p-8 text-center ${i > 0 ? "md:border-l" : ""} ${i >= 2 ? "border-t md:border-t-0" : ""} ${i === 1 ? "border-l md:border-l" : ""} border-border`}
          >
            <div className="font-display text-3xl sm:text-4xl font-bold gradient-text">{s.value}</div>
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="max-w-2xl">
      <div className="inline-flex items-center gap-2 rounded-full bg-accent text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
        {eyebrow}
      </div>
      <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy tracking-tight">{title}</h2>
      {desc && <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">{desc}</p>}
    </div>
  );
}

/** The two headline services, side by side. */
function CoreServices({ images, settings }: { images: SiteImages; settings: Settings }) {
  const painting = pickImage(images, "finished_room", {
    src: roomImg,
    alt: "Freshly painted living room with a deep-blue feature wall",
  });
  const sofa = pickImage(images, "sofa_cleaning", {
    src: sofaImg,
    alt: "Fabric sofa before and after professional deep cleaning",
  });
  const cards = [
    {
      icon: PaintRoller,
      eyebrow: "Painting",
      title: getSetting(settings, "home_painting_title", "Painting services"),
      desc: getSetting(
        settings,
        "home_painting_desc",
        "Interior and exterior painting for apartments, villas and offices — walls, ceilings, doors, trims and feature walls, finished in 1–6 days.",
      ),
      points: ["Studio from AED 650 · Villa from AED 3,500", "Crack filling, putty & sanding included", "Furniture and floors fully covered"],
      img: painting,
      slug: "interior-painting",
      cta: "Explore painting",
    },
    {
      icon: Sofa,
      eyebrow: "Sofa Cleaning",
      title: getSetting(settings, "home_sofa_title", "Sofa & upholstery cleaning"),
      desc: getSetting(
        settings,
        "home_sofa_desc",
        "Deep shampoo and hot-water extraction at your home for fabric sofas, L-shapes, majlis, dining chairs and mattresses — dry in a few hours.",
      ),
      points: ["3-seater from AED 149", "Stains, odours & dust mites removed", "Child- and pet-safe solutions"],
      img: sofa,
      slug: "sofa-cleaning",
      cta: "Explore sofa cleaning",
    },
  ];
  return (
    <section className="container-page py-24">
      <SectionHeader
        eyebrow={getSetting(settings, "home_core_eyebrow", "What we do")}
        title={getSetting(settings, "home_core_title", "Two services. Done properly.")}
        desc={getSetting(
          settings,
          "home_core_desc",
          "We focus on what we do best — painting and sofa cleaning — so every job gets an experienced team, the right equipment and a finish you'll notice.",
        )}
      />
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {cards.map(({ icon: Icon, ...c }) => (
          <article key={c.slug} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-card hover-lift flex flex-col">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={c.img.src}
                alt={c.img.alt}
                width={1600}
                height={1000}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-soft">
                <Icon className="h-4 w-4" /> {c.eyebrow}
              </span>
            </div>
            <div className="p-7 sm:p-8 flex flex-col flex-1">
              <h3 className="font-display text-2xl font-bold text-navy">{c.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{c.desc}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {c.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-navy">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" /> {p}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-7">
                <Link
                  to="/services/$slug"
                  params={{ slug: c.slug }}
                  className="inline-flex items-center gap-2 rounded-full gradient-brand text-white px-6 py-3 text-sm font-semibold"
                >
                  {c.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServicesSection({
  services,
  settings,
}: {
  services: Awaited<ReturnType<typeof listServicesPublic>>;
  settings: Settings;
}) {
  if (services.length === 0) return null;
  return (
    <section id="services" className="bg-gradient-to-b from-accent/60 to-background py-24">
      <div className="container-page">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <SectionHeader
            eyebrow={getSetting(settings, "home_services_eyebrow", "All services")}
            title={getSetting(settings, "home_services_title", "Everything your walls and furniture need.")}
            desc={getSetting(
              settings,
              "home_services_desc",
              "From a single feature wall to a full villa repaint, and from one armchair to a 10-metre majlis.",
            )}
          />
          <Link to="/services" className="text-primary font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = getIcon("icon" in s ? (s.icon as string | null) : null);
            return (
              <article
                key={s.id}
                className="group relative rounded-2xl bg-card p-6 border border-border shadow-card hover-lift overflow-hidden"
              >
                <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-accent opacity-60 group-hover:scale-125 transition-transform duration-500" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-xl gradient-brand text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="relative mt-4 font-display text-lg font-semibold text-navy">{s.title}</h3>
                <p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                {"slug" in s && s.slug && (
                  <Link
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
                  >
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingPreview({
  packages,
  settings,
}: {
  packages: Awaited<ReturnType<typeof listFleetPublic>>;
  settings: Settings;
}) {
  if (packages.length === 0) return null;
  const painting = packages.filter((p) => p.category.toLowerCase().includes("paint")).slice(0, 3);
  const sofa = packages.filter((p) => !p.category.toLowerCase().includes("paint")).slice(0, 3);
  const groups = [
    { label: "Painting", icon: PaintRoller, items: painting },
    { label: "Sofa Cleaning", icon: Sofa, items: sofa },
  ].filter((g) => g.items.length > 0);
  return (
    <section className="container-page py-24">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <SectionHeader
          eyebrow={getSetting(settings, "home_fleet_eyebrow", "Prices")}
          title={getSetting(settings, "home_fleet_title", "Clear prices, before we start.")}
          desc={getSetting(
            settings,
            "home_fleet_desc",
            "Starting prices for our most-booked jobs. Your final price is fixed after we see photos or inspect the space — no surprises.",
          )}
        />
        <Link to="/pricing" className="text-primary font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
          Full price list <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {groups.map(({ label, icon: Icon, items }) => (
          <div key={label} className="rounded-3xl border border-border bg-card shadow-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-xl font-bold text-navy">{label}</h3>
            </div>
            <ul className="mt-6 divide-y divide-border">
              {items.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <div className="font-semibold text-navy">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.volume}</div>
                  </div>
                  {p.starting_price != null && (
                    <div className="text-right shrink-0">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
                      <div className="font-display text-lg font-bold text-primary">
                        {p.currency ?? "AED"} {Number(p.starting_price).toLocaleString("en-US")}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Camera, title: "Send photos or call", text: "WhatsApp a few photos of the rooms or sofa, or call us. Bigger jobs get a free site visit." },
    { icon: BadgeCheck, title: "Get a fixed price", text: "We send a clear quote with paint brand, coats, timing and what's included." },
    { icon: CalendarCheck, title: "Pick your slot", text: "Same-day sofa cleaning and next-day painting starts are often available." },
    { icon: ThumbsUp, title: "Clean handover", text: "We cover, work, tidy up and walk you through the result before we leave." },
  ];
  return (
    <section className="bg-navy text-white py-24">
      <div className="container-page">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 text-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
            How it works
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Booked in minutes. Finished on time.
          </h2>
        </div>
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-2xl bg-white/5 border border-white/10 p-6">
              <span className="absolute right-5 top-4 font-display text-5xl font-bold text-white/10">{i + 1}</span>
              <Icon className="h-8 w-8 text-secondary" />
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function WhyUs({ images, settings }: { images: SiteImages; settings: Settings }) {
  const sofa = pickImage(images, "sofa_cleaning", {
    src: sofaImg,
    alt: "Fabric sofa before and after professional deep cleaning",
  });
  const { data: pageContent = [] } = useQuery(pageContentQuery("home"));
  const cmsItems = contentForSection(pageContent, "why_us");
  const items =
    cmsItems.length > 0
      ? cmsItems.map((row) => ({ icon: getIcon(row.icon), title: row.heading, desc: row.body }))
      : [
          { icon: BadgeCheck, title: "Fixed, honest prices", desc: "The price we quote is the price you pay — materials and labour included." },
          { icon: Shield, title: "Your home protected", desc: "Floors, furniture and fittings covered before a single brush or machine comes out." },
          { icon: Sparkles, title: "Premium materials", desc: "Jotun, National Paints and Dulux paints; professional, fabric-safe cleaning solutions." },
          { icon: Clock, title: "On time, every time", desc: "Uniformed teams that arrive when we say and finish when we promised." },
        ];
  return (
    <section className="container-page py-24">
      <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <img
            src={sofa.src}
            alt={sofa.alt}
            width={1600}
            height={1000}
            loading="lazy"
            className="rounded-3xl shadow-elegant w-full object-cover"
          />
          <div className="absolute -bottom-6 -right-4 sm:-right-8 rounded-2xl bg-white border border-border shadow-elegant p-5 max-w-[16rem]">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Clock className="h-5 w-5" /> 3–6 hours
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Typical sofa drying time after hot-water extraction.</div>
          </div>
        </div>
        <div>
          <SectionHeader
            eyebrow={getSetting(settings, "home_why_eyebrow", "Why Matla Al Anwar")}
            title={getSetting(settings, "home_why_title", "Careful people. Clean results.")}
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {items.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-5 border border-border bg-card shadow-card">
                <Icon className="h-7 w-7 text-primary" />
                <h3 className="mt-3 font-display font-semibold text-navy">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function IndustriesStrip() {
  const { data: industries } = useSuspenseQuery(industriesQuery());
  const names = industries.map((i) => i.name);
  if (names.length === 0) return null;
  const list = [...names, ...names];
  return (
    <section className="border-y border-border bg-accent overflow-hidden py-8">
      <div className="flex items-center animate-marquee whitespace-nowrap">
        {list.map((i, idx) => (
          <Link
            key={idx}
            to="/industries"
            className="mx-8 text-navy/70 hover:text-primary font-display text-xl sm:text-2xl font-semibold flex items-center gap-8 transition-colors"
          >
            {i}
            <Sparkles className="h-4 w-4 text-primary/50" aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  );
}

function CoverageSection({ settings }: { settings: Settings }) {
  const { data: locations = [] } = useQuery(locationsQuery());
  return (
    <section className="container-page py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeader
            eyebrow={getSetting(settings, "home_coverage_eyebrow", "Areas")}
            title={getSetting(settings, "home_coverage_title", "Painting and sofa cleaning in every emirate.")}
            desc={getSetting(
              settings,
              "home_coverage_desc",
              "Same-day sofa cleaning in Dubai, Sharjah and Ajman, and scheduled painting and cleaning visits everywhere from Abu Dhabi to Fujairah.",
            )}
          />
          <ul className="mt-8 grid grid-cols-2 gap-3">
            {locations.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/locations/$city"
                  params={{ city: c.slug }}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:border-primary hover:bg-accent transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium text-navy">
                    <MapPin className="h-4 w-4 text-primary" /> {c.name}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <UAEMap cities={locations} />
        </div>
      </div>
    </section>
  );
}

/** Only real customer reviews added in Admin → Page Content are shown here. */
function TestimonialsSection({ settings }: { settings: Settings }) {
  const { data: pageContent = [] } = useQuery(pageContentQuery("home"));
  const testimonials = contentForSection(pageContent, "testimonials").map((row) => ({
    quote: row.body,
    name: row.heading,
    role: row.subheading,
  }));
  if (testimonials.length === 0) return null;
  return (
    <section className="bg-accent/50 py-24">
      <div className="container-page">
        <SectionHeader
          eyebrow={getSetting(settings, "home_testimonials_eyebrow", "Reviews")}
          title={getSetting(settings, "home_testimonials_title", "What our customers say.")}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name + t.quote} className="rounded-2xl bg-white p-7 border border-border shadow-card flex flex-col">
              <div className="flex gap-0.5 text-warm" aria-label="5 star rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-navy leading-relaxed flex-1">"{t.quote}"</blockquote>
              <figcaption className="mt-6 pt-4 border-t border-border">
                <div className="font-semibold text-navy">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ settings }: { settings: Settings }) {
  const { phone, phoneHref, whatsappHref } = useContact(settings);
  return (
    <section className="container-page pb-24">
      <div className="relative overflow-hidden rounded-3xl gradient-brand text-white p-10 sm:p-14 shadow-elegant">
        <div className="absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {getSetting(settings, "home_cta_title", "Ready for fresh walls or a spotless sofa?")}
            </h2>
            <p className="mt-3 text-white/85 max-w-lg">
              {getSetting(
                settings,
                "home_cta_desc",
                "Send us a few photos on WhatsApp and get a fixed price — usually within the hour.",
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-6 py-3.5 text-sm font-semibold hover:bg-ice"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp Us
            </a>
            <a
              href={phoneHref}
              className="inline-flex items-center gap-2 rounded-full bg-navy/40 backdrop-blur border border-white/30 text-white px-6 py-3.5 text-sm font-semibold hover:bg-navy/60"
            >
              <Phone className="h-4 w-4" /> {phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
