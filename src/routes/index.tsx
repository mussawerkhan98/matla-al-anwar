import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  Snowflake,
  Truck,
  Shield,
  Clock,
  ThermometerSnowflake,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";
import { SITE, STATS, canonicalUrl } from "@/lib/site";
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
import { HeroSnowfall } from "@/components/HeroSnowfall";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero-chiller-van.jpg";
import interiorImg from "@/assets/cold-chain-interior.jpg";
import fleetImg from "@/assets/fleet-lineup.jpg";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const fleetQuery = () =>
  queryOptions({ queryKey: ["fleet", "list"], queryFn: () => listFleetPublic() });
const servicesQuery = () =>
  queryOptions({ queryKey: ["services", "list"], queryFn: () => listServicesPublic() });
const faqsQuery = () =>
  queryOptions({ queryKey: ["faqs", "list", "home"], queryFn: () => listFaqsPublic({ data: { page: "home" } }) });
const industriesQuery = () =>
  queryOptions({ queryKey: ["industries", "list"], queryFn: () => listIndustriesPublic() });

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [fleet, services, faqs, images, settings] = await Promise.all([
      context.queryClient.ensureQueryData(fleetQuery()),
      context.queryClient.ensureQueryData(servicesQuery()),
      context.queryClient.ensureQueryData(faqsQuery()),
      context.queryClient.ensureQueryData(siteImagesQuery()),
      context.queryClient.ensureQueryData(settingsQuery()),
      context.queryClient.ensureQueryData(industriesQuery()),
      context.queryClient.ensureQueryData(locationsQuery()),
      context.queryClient.ensureQueryData(pageContentQuery("home")),
    ]);
    return { fleet, services, faqs, images, settings };
  },
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    const faqs = loaderData?.faqs ?? [];
    const title = getSetting(
      settings,
      "meta_home_title",
      "Matla Al Anwar Chiller Van Transport UAE | Refrigerated Truck Rental Dubai",
    );
    const description = getSetting(
      settings,
      "meta_home_description",
      "Premium refrigerated chiller van & freezer truck rental across the UAE. 24/7 temperature-controlled cold-chain logistics for food, pharma, seafood & flowers. Call +971 50 000 0000.",
    );
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonicalUrl("/") },
      ],
      links: [{ rel: "canonical", href: canonicalUrl("/") }],
      scripts: [
        {
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
        },
      ],
    };
  },
  component: Home,
});

function Home() {
  const { data: fleet } = useSuspenseQuery(fleetQuery());
  const { data: services } = useSuspenseQuery(servicesQuery());
  const { data: faqs } = useSuspenseQuery(faqsQuery());
  const { data: images } = useSuspenseQuery(siteImagesQuery());
  const { data: settings } = useSuspenseQuery(settingsQuery());

  return (
    <>
      <Hero images={images} settings={settings} />
      <StatsBar />
      <ServicesSection services={services} settings={settings} />
      <FleetSection fleet={fleet} images={images} settings={settings} />
      <WhyUs images={images} settings={settings} />
      <IndustriesStrip />
      <CoverageSection settings={settings} />
      <TestimonialsSection settings={settings} />
      <FaqSection
        faqs={faqs}
        desc="Everything you need to know about our chiller and freezer transport services."
        limit={5}
      />
      <CTASection settings={settings} />
    </>
  );
}

type Images = ReturnType<
  typeof useSuspenseQuery<Awaited<ReturnType<typeof listFleetPublic>>>
>["data"];

function Hero({
  images,
  settings,
}: {
  images: Awaited<ReturnType<typeof import("@/lib/images.functions").listSiteImagesPublic>>;
  settings: Record<string, string | null>;
}) {
  const hero = pickImage(images, "home_hero", {
    src: heroImg,
    alt: "Refrigerated chiller van on Dubai highway at golden hour",
  });
  const phone = getSetting(settings, "site_phone", SITE.phone);
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const whatsapp = getSetting(settings, "site_whatsapp", SITE.whatsapp);
  const whatsappHref = `https://wa.me/${whatsapp}?text=Hello%20Matla%20Al%20Anwar%2C%20I%20need%20a%20chiller%20van%20quote.`;

  const isDark = getSetting(settings, "hero_text_theme", "light") === "dark";
  const badgeText = getSetting(settings, "hero_badge_text", "UAE-wide cold-chain logistics");
  const title = getSetting(settings, "hero_title", "Refrigerated transport you can trust, city to city.");
  const subtitle = getSetting(
    settings,
    "hero_subtitle",
    `${SITE.name} delivers premium chiller and freezer vehicles across all seven emirates. Temperature-controlled, HACCP-aligned, 24/7 dispatched — for food, pharma, seafood, floral and specialty cold cargo.`,
  );

  const textCls = isDark ? "text-navy" : "text-white";
  const subtitleCls = isDark ? "text-navy/80" : "text-white/85";
  const badgeCls = isDark
    ? "bg-navy/5 backdrop-blur-md border border-navy/15 text-navy"
    : "bg-white/10 backdrop-blur-md border border-white/20 text-white";
  const checklistCls = isDark ? "text-navy/80" : "text-white/85";

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={hero.src}
          alt={hero.alt}
          width={1920}
          height={1080}
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: isDark ? "var(--gradient-hero-light)" : "var(--gradient-hero)" }}
        />
        <HeroSnowfall />
      </div>
      <div className="container-page relative pt-20 pb-28 lg:pt-32 lg:pb-40">
        <div className="max-w-3xl animate-fade-up">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider ${badgeCls}`}>
            <Snowflake className="h-3.5 w-3.5 text-secondary" />
            {badgeText}
          </div>
          <h1 className={`mt-6 font-display text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight ${textCls}`}>
            {title}
          </h1>
          <p className={`mt-6 max-w-2xl text-lg leading-relaxed ${subtitleCls}`}>
            {subtitle}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full gradient-brand text-white px-7 py-3.5 text-sm font-semibold shadow-elegant hover-lift"
            >
              Get Instant Quote <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-3.5 text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={phoneHref}
              className="inline-flex items-center gap-2 rounded-full bg-white text-navy px-6 py-3.5 text-sm font-semibold hover:bg-ice transition-colors"
            >
              <Phone className="h-4 w-4" /> {phone}
            </a>
          </div>

          <ul className={`mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 max-w-2xl text-sm ${checklistCls}`}>
            {["+2°C to −25°C", "±0.5°C accuracy", "HACCP aligned", "24/7 dispatch"].map((f) => (
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
            <div className="font-display text-3xl sm:text-4xl font-bold gradient-text">
              {s.value}
            </div>
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="inline-flex items-center gap-2 rounded-full bg-accent text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
        {eyebrow}
      </div>
      <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy tracking-tight">
        {title}
      </h2>
      {desc && (
        <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">{desc}</p>
      )}
    </div>
  );
}

function ServicesSection({
  services,
  settings,
}: {
  services: Awaited<ReturnType<typeof listServicesPublic>>;
  settings: Record<string, string | null>;
}) {
  return (
    <section id="services" className="container-page py-24">
      <SectionHeader
        eyebrow={getSetting(settings, "home_services_eyebrow", "Services")}
        title={getSetting(settings, "home_services_title", "Cold-chain logistics, engineered for the UAE.")}
        desc={getSetting(
          settings,
          "home_services_desc",
          "Purpose-built vehicles, trained drivers and continuous temperature monitoring — for every industry that depends on the cold chain.",
        )}
      />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <article
            key={s.id}
            className="group relative rounded-2xl bg-card p-6 border border-border shadow-card hover-lift overflow-hidden"
          >
            <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-accent opacity-60 group-hover:scale-125 transition-transform duration-500" />
            <ThermometerSnowflake className="relative h-9 w-9 text-primary" />
            <h3 className="relative mt-4 font-display text-lg font-semibold text-navy">
              {s.title}
            </h3>
            <p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">
              {s.description}
            </p>
            {"slug" in s && s.slug && (
              <Link
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
              >
                Learn more →
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function FleetSection({
  fleet,
  images,
  settings,
}: {
  fleet: Awaited<ReturnType<typeof listFleetPublic>>;
  images: Awaited<ReturnType<typeof import("@/lib/images.functions").listSiteImagesPublic>>;
  settings: Record<string, string | null>;
}) {
  const lineup = pickImage(images, "fleet_lineup", {
    src: fleetImg,
    alt: "Matla Al Anwar refrigerated fleet lineup",
  });
  return (
    <section id="fleet" className="bg-gradient-to-b from-accent/60 to-background py-24">
      <div className="container-page">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <SectionHeader
            eyebrow={getSetting(settings, "home_fleet_eyebrow", "Our Fleet")}
            title={getSetting(settings, "home_fleet_title", "From compact chiller vans to 5-ton freezer trucks.")}
            desc={getSetting(
              settings,
              "home_fleet_desc",
              "A modern, meticulously maintained fleet — matched to your cargo, route and temperature profile.",
            )}
          />
          <Link
            to="/fleet"
            className="text-primary font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            View full fleet <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-card">
            <img
              src={lineup.src}
              alt={lineup.alt}
              width={1600}
              height={900}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="lg:col-span-3 grid gap-4 sm:grid-cols-2">
            {fleet.slice(0, 4).map((v) => (
              <div
                key={v.id}
                className="rounded-2xl bg-card p-5 border border-border shadow-card hover-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    {v.category}
                  </span>
                  <Truck className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-navy">{v.name}</h3>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Capacity</dt>
                    <dd className="font-semibold text-navy">{v.capacity}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Volume</dt>
                    <dd className="font-semibold text-navy">{v.volume}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Temperature</dt>
                    <dd className="font-semibold text-primary">{v.temp_range}</dd>
                  </div>
                </dl>
                {v.starting_price != null && (
                  <p className="mt-3 text-xs">
                    <span className="text-muted-foreground">From </span>
                    <span className="font-bold text-primary">
                      {v.currency ?? "AED"} {v.starting_price}/day
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyUs({
  images,
  settings,
}: {
  images: Awaited<ReturnType<typeof import("@/lib/images.functions").listSiteImagesPublic>>;
  settings: Record<string, string | null>;
}) {
  const interior = pickImage(images, "cold_chain_interior", {
    src: interiorImg,
    alt: "Interior of a refrigerated van maintaining sub-zero temperature",
  });
  const { data: pageContent = [] } = useQuery(pageContentQuery("home"));
  const cmsItems = contentForSection(pageContent, "why_us");
  const items =
    cmsItems.length > 0
      ? cmsItems.map((row) => ({ icon: getIcon(row.icon), title: row.heading, desc: row.body }))
      : [
          {
            icon: ThermometerSnowflake,
            title: "Precision temperature control",
            desc: "Continuous monitoring with calibrated loggers. Every delivery, fully traceable.",
          },
          {
            icon: Clock,
            title: "24/7 dispatch",
            desc: "Round-the-clock availability with emergency response across all seven emirates.",
          },
          {
            icon: Shield,
            title: "Compliance-first",
            desc: "Dubai Municipality permits, HACCP-aligned handling, GDP-aware pharma routes.",
          },
          {
            icon: Truck,
            title: "Modern maintained fleet",
            desc: "Regularly serviced chiller vans, freezer trucks and pickups — always road-ready.",
          },
        ];
  return (
    <section className="container-page py-24">
      <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <img
            src={interior.src}
            alt={interior.alt}
            width={1280}
            height={960}
            loading="lazy"
            className="rounded-3xl shadow-elegant w-full object-cover"
          />
          <div className="absolute -bottom-6 -right-4 sm:-right-8 rounded-2xl bg-white border border-border shadow-elegant p-5 max-w-[16rem]">
            <div className="flex items-center gap-2 text-primary font-bold">
              <ThermometerSnowflake className="h-5 w-5" /> −18.2°C
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Live cargo temperature during last frozen-goods run.
            </div>
          </div>
        </div>
        <div>
          <SectionHeader
            eyebrow={getSetting(settings, "home_why_eyebrow", "Why Matla Al Anwar")}
            title={getSetting(settings, "home_why_title", "A cold-chain partner, not just a transporter.")}
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
  const { data: industries = [] } = useQuery(industriesQuery());
  const names = industries.map((i) => i.name);
  const list = [...names, ...names];
  return (
    <section className="border-y border-border bg-navy overflow-hidden py-8">
      <div className="flex items-center animate-marquee whitespace-nowrap">
        {list.map((i, idx) => (
          <Link
            key={idx}
            to="/industries"
            className="mx-8 text-white/70 hover:text-white font-display text-xl sm:text-2xl font-semibold flex items-center gap-8 transition-colors"
          >
            {i}
            <Snowflake className="h-4 w-4 text-secondary/60" aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  );
}

function CoverageSection({ settings }: { settings: Record<string, string | null> }) {
  const { data: locations = [] } = useQuery(locationsQuery());
  return (
    <section className="container-page py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeader
            eyebrow={getSetting(settings, "home_coverage_eyebrow", "Coverage")}
            title={getSetting(settings, "home_coverage_title", "Every emirate. Every temperature. Every day.")}
            desc={getSetting(
              settings,
              "home_coverage_desc",
              "From Deira to Fujairah, we run scheduled and on-demand chiller routes across the UAE — with local response teams in every emirate.",
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
          <UAEMapLazy />
        </div>
      </div>
    </section>
  );
}

// Inline lazy wrapper: static import is fine here, kept as component boundary.
import { UAEMap } from "@/components/UAEMap";
function UAEMapLazy() {
  const { data: locations = [] } = useQuery(locationsQuery());
  return <UAEMap cities={locations} />;
}

function TestimonialsSection({ settings }: { settings: Record<string, string | null> }) {
  const { data: pageContent = [] } = useQuery(pageContentQuery("home"));
  const cmsTestimonials = contentForSection(pageContent, "testimonials");
  const testimonials =
    cmsTestimonials.length > 0
      ? cmsTestimonials.map((row) => ({ quote: row.body, name: row.heading, role: row.subheading }))
      : [
          {
            quote:
              "Matla Al Anwar has become our default chiller partner for daily hotel supply runs. Their drivers understand cold-chain — not just delivery.",
            name: "Operations Manager",
            role: "5-Star Hotel, Dubai Marina",
          },
          {
            quote:
              "Temperature logs on every trip, on-time pickups, and a team that answers WhatsApp at 3am. That's rare in this industry.",
            name: "Logistics Lead",
            role: "Pharma Distributor, Abu Dhabi",
          },
          {
            quote:
              "We moved 4 tons of frozen seafood from Fujairah to Sharjah with zero temperature deviation. Highly recommended.",
            name: "Procurement Head",
            role: "Seafood Wholesaler",
          },
        ];
  return (
    <section className="bg-accent/50 py-24">
      <div className="container-page">
        <SectionHeader
          eyebrow={getSetting(settings, "home_testimonials_eyebrow", "Testimonials")}
          title={getSetting(settings, "home_testimonials_title", "Trusted by UAE's cold-chain operators.")}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl bg-white p-7 border border-border shadow-card flex flex-col"
            >
              <div className="flex gap-0.5 text-primary" aria-label="5 star rating">
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

function CTASection({ settings }: { settings: Record<string, string | null> }) {
  const phone = getSetting(settings, "site_phone", SITE.phone);
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const whatsapp = getSetting(settings, "site_whatsapp", SITE.whatsapp);
  const whatsappHref = `https://wa.me/${whatsapp}?text=Hello%20Matla%20Al%20Anwar%2C%20I%20need%20a%20chiller%20van%20quote.`;
  return (
    <section className="container-page pb-24">
      <div className="relative overflow-hidden rounded-3xl gradient-brand text-white p-10 sm:p-14 shadow-elegant">
        <div className="absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {getSetting(settings, "home_cta_title", "Need a chiller van today?")}
            </h2>
            <p className="mt-3 text-white/85 max-w-lg">
              {getSetting(
                settings,
                "home_cta_desc",
                "Message us on WhatsApp for an instant quote, or call our 24/7 dispatch line. We usually reply within minutes.",
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
