import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, Clock, ArrowRight, Phone, CheckCircle2, PaintRoller, Sofa } from "lucide-react";
import { SITE, SERVICES, PACKAGES, canonicalUrl } from "@/lib/site";
import { getLocationBySlug, listLocationsPublic } from "@/lib/locations.functions";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const Route = createFileRoute("/locations/$city")({
  loader: async ({ params }) => {
    const [city, allCities] = await Promise.all([
      getLocationBySlug({ data: { slug: params.city } }),
      listLocationsPublic(),
    ]);
    if (!city) throw notFound();
    return { city, allCities };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Location — Matla Al Anwar Painting & Sofa Cleaning" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const c = loaderData.city;
    const title = (c as any).meta_title?.trim() || `Painting & Sofa Cleaning in ${c.name} | Painters & Upholstery Cleaners — Matla Al Anwar`;
    const desc = (c as any).meta_description?.trim() || `Professional apartment & villa painting and sofa, majlis & mattress cleaning in ${c.name}. Fixed prices, free inspection and ${c.response_time.toLowerCase()} slots. Call or WhatsApp Matla Al Anwar.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonicalUrl(`/locations/${params.city}`) },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: canonicalUrl(`/locations/${params.city}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HomeAndConstructionBusiness",
            name: `${SITE.name} — ${c.name}`,
            description: desc,
            telephone: SITE.phone,
            email: SITE.email,
            url: canonicalUrl(`/locations/${params.city}`),
            areaServed: { "@type": "City", name: c.name, addressCountry: "AE" },
            address: { "@type": "PostalAddress", addressLocality: c.name, addressCountry: "AE" },
            openingHours: "Mo-Su 08:00-22:00",
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: buildLocalFaqs(c.name).map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
              { "@type": "ListItem", position: 2, name: "Areas", item: canonicalUrl("/locations") },
              { "@type": "ListItem", position: 3, name: c.name, item: canonicalUrl(`/locations/${params.city}`) },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <section className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-navy">City not found</h1>
      <p className="mt-3 text-muted-foreground">We serve all seven emirates — pick from the map.</p>
      <Link to="/locations" className="mt-6 inline-flex items-center gap-2 rounded-full gradient-brand text-white px-6 py-3 text-sm font-semibold">
        View coverage <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  ),
  component: CityPage,
});

function CityPage() {
  const { city: c, allCities } = Route.useLoaderData();
  const other = allCities.filter((x) => x.slug !== c.slug).slice(0, 4);
  const localFaqs = buildLocalFaqs(c.name);
  const neighborhoods = c.neighborhoods
    ? c.neighborhoods.split(",").map((n) => n.trim()).filter(Boolean)
    : [];

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent via-white to-white" />
        <div className="container-page py-16 lg:py-20 grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
              <Link to="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/locations" className="hover:text-primary">Areas</Link>
              <span className="mx-2">/</span>
              <span className="text-navy">{c.name}</span>
            </nav>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
              <MapPin className="h-3 w-3" /> {c.name}, UAE
            </div>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-navy tracking-tight">
              {(c as any).h1_override?.trim() ? (
                (c as any).h1_override
              ) : (
                <>Painting &amp; Sofa Cleaning in <span className="gradient-text">{c.name}</span></>
              )}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl">{c.blurb}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={SITE.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full gradient-brand text-white px-6 py-3.5 text-sm font-semibold shadow-elegant hover-lift">
                <WhatsAppIcon className="h-4 w-4" /> Book on WhatsApp
              </a>
              <a href={SITE.phoneHref} className="inline-flex items-center gap-2 rounded-full bg-white border border-border text-navy px-6 py-3.5 text-sm font-semibold hover:bg-accent">
                <Phone className="h-4 w-4" /> {SITE.phone}
              </a>
            </div>
          </div>

          <aside className="rounded-3xl bg-navy text-white p-6 shadow-elegant">
            <div className="flex items-center gap-2 text-secondary text-sm font-semibold">
              <Clock className="h-4 w-4" /> Availability
            </div>
            <div className="mt-1 font-display text-3xl font-bold">{c.response_time}</div>
            <p className="mt-2 text-sm text-ice/70">Typical booking slot for sofa cleaning in {c.name}. Painting starts are scheduled after inspection.</p>
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="text-xs uppercase tracking-wider text-ice/60">Popular areas</div>
              <ul className="mt-2 flex flex-wrap gap-2">
                {neighborhoods.map((n) => (
                  <li key={n} className="text-xs bg-white/10 border border-white/10 rounded-full px-3 py-1">{n}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy max-w-2xl">
          Why {c.name} homes choose Matla Al Anwar.
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Free inspection & fixed quote",
            "Jotun, National & Dulux paints",
            "Furniture & floors protected",
            "Fast-dry sofa extraction",
          ].map((f) => (
            <div key={f} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <p className="mt-3 font-semibold text-navy text-sm">{f}</p>
            </div>
          ))}
        </div>
      </section>

      {c.body_content && (
        <section className="container-page py-8">
          <div
            className="
              max-w-3xl
              text-[17px] leading-8 text-foreground/90
              [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-navy [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:first:mt-0
              [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-navy [&_h3]:mt-6 [&_h3]:mb-2
              [&_p]:mb-4 [&_p]:text-foreground/85
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1.5
              [&_li]:leading-7
              [&_strong]:text-navy [&_strong]:font-semibold
              [&_table]:w-full [&_table]:my-6 [&_table]:text-sm
              [&_th]:text-left [&_th]:font-semibold [&_th]:text-navy [&_th]:border-b [&_th]:border-border [&_th]:p-2
              [&_td]:border-b [&_td]:border-border [&_td]:p-2
            "
            dangerouslySetInnerHTML={{ __html: c.body_content }}
          />
        </section>
      )}

      <section className="container-page py-8">
        <div className="rounded-3xl overflow-hidden border border-border shadow-card">
          <iframe
            title={`Google Map of ${c.name}, UAE`}
            src={
              (c as any).google_maps_url?.trim() ||
              `https://www.google.com/maps?q=${encodeURIComponent(c.name + ', United Arab Emirates')}&output=embed`
            }
            className="w-full h-[400px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="font-display text-3xl font-bold text-navy">Our services in {c.name}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((sv) => (
            <Link
              key={sv.slug}
              to="/services/$slug"
              params={{ slug: sv.slug }}
              className="group rounded-2xl border border-border bg-card p-5 shadow-card hover-lift"
            >
              {sv.slug.includes("paint") ? (
                <PaintRoller className="h-6 w-6 text-primary" />
              ) : (
                <Sofa className="h-6 w-6 text-primary" />
              )}
              <h3 className="mt-3 font-display text-lg font-semibold text-navy group-hover:text-primary transition-colors">
                {sv.title} in {c.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{sv.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-8">
        <div className="rounded-3xl border border-border bg-accent/50 p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-navy">Starting prices in {c.name}</h2>
            <Link to="/pricing" className="text-sm font-semibold text-primary inline-flex items-center gap-1">
              Full price list <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PACKAGES.slice(0, 8).map((p) => (
              <li key={p.slug} className="rounded-xl bg-white border border-border p-4">
                <div className="text-sm font-semibold text-navy">{p.name}</div>
                <div className="mt-1 text-primary font-display font-bold">From AED {p.startingPrice.toLocaleString("en-US")}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="font-display text-3xl font-bold text-navy max-w-2xl">Painting &amp; sofa cleaning FAQs — {c.name}</h2>
        <div className="mt-8 max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden shadow-card">
          {localFaqs.map((f) => (
            <details key={f.q} className="group p-6">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-display font-semibold text-navy list-none">
                {f.q}
                <span className="h-8 w-8 rounded-full bg-accent text-primary flex items-center justify-center transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="font-display text-2xl font-bold text-navy">Also serving nearby emirates</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {other.map((o) => (
            <Link
              key={o.slug}
              to="/locations/$city"
              params={{ city: o.slug }}
              className="group rounded-2xl border border-border bg-card p-5 hover-lift flex items-center justify-between"
            >
              <span className="font-semibold text-navy flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> {o.name}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function buildLocalFaqs(city: string) {
  return [
    {
      q: `Do you provide painting services in ${city}?`,
      a: `Yes. We paint apartments, villas, offices and shops across ${city} — interior walls and ceilings, doors and trims, and villa exteriors. Studios start from AED 650 and villas from AED 3,500, with a free inspection for bigger jobs.`,
    },
    {
      q: `How much is sofa cleaning in ${city}?`,
      a: `Sofa cleaning in ${city} starts from AED 149 for a 3-seater and AED 249 for an L-shape or 5–7 seater. Majlis cleaning is priced per metre and mattresses start from AED 99.`,
    },
    {
      q: `How soon can you come to ${city}?`,
      a: `Sofa cleaning is often available the same or next day in ${city}. Painting jobs are scheduled after a quick inspection or once we've seen photos, usually within 1–3 days.`,
    },
    {
      q: "Do I need to move my furniture before painting?",
      a: "No. Our team moves furniture to the centre of the room and covers it, along with floors and fittings, before painting starts — and puts everything back afterwards.",
    },
    {
      q: "Are your cleaning products safe for children and pets?",
      a: "Yes. We use professional, fabric-safe and non-toxic cleaning solutions, and rinse thoroughly with hot-water extraction so no sticky residue is left behind.",
    },
  ];
}
