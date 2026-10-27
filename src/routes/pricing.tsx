import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PaintRoller, Sofa, Clock, Ruler, CheckCircle2, ArrowRight, Info } from "lucide-react";
import { listFleetPublic } from "@/lib/fleet.functions";
import { canonicalUrl, SITE, whatsappLink } from "@/lib/site";
import { listFaqsPublic } from "@/lib/faqs.functions";
import { FaqSection } from "@/components/FaqSection";
import { settingsQuery, getSetting } from "@/lib/settings.query";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const pricingFaqsQuery = () =>
  queryOptions({
    queryKey: ["faqs", "list", "fleet"],
    queryFn: () => listFaqsPublic({ data: { page: "fleet" } }),
  });

const packagesQuery = () =>
  queryOptions({ queryKey: ["fleet", "list"], queryFn: () => listFleetPublic() });

const TITLE = "Painting & Sofa Cleaning Prices in Dubai & UAE | Matla Al Anwar";
const DESCRIPTION =
  "Transparent prices for apartment & villa painting (studio from AED 650, villa from AED 3,500) and sofa cleaning (3-seater from AED 149, mattress from AED 99) across the UAE.";

export const Route = createFileRoute("/pricing")({
  head: ({ loaderData }) => {
    const packages = (loaderData?.[0] ?? []) as Awaited<ReturnType<typeof listFleetPublic>>;
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:url", content: canonicalUrl("/pricing") },
      ],
      links: [{ rel: "canonical", href: canonicalUrl("/pricing") }],
      scripts:
        packages.length > 0
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "OfferCatalog",
                  name: `${SITE.name} price list`,
                  itemListElement: packages
                    .filter((p) => p.starting_price != null)
                    .map((p) => ({
                      "@type": "Offer",
                      itemOffered: { "@type": "Service", name: p.name, description: p.volume },
                      priceSpecification: {
                        "@type": "PriceSpecification",
                        price: p.starting_price,
                        priceCurrency: p.currency ?? "AED",
                        minPrice: p.starting_price,
                      },
                      areaServed: "United Arab Emirates",
                    })),
                }),
              },
            ]
          : [],
    };
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(packagesQuery()),
      context.queryClient.ensureQueryData(pricingFaqsQuery()),
      context.queryClient.ensureQueryData(settingsQuery()),
    ]),
  component: PricingPage,
});

function PricingPage() {
  const { data: packages } = useSuspenseQuery(packagesQuery());
  const { data: faqs = [] } = useSuspenseQuery(pricingFaqsQuery());
  const { data: settings } = useSuspenseQuery(settingsQuery());
  const whatsapp = getSetting(settings, "site_whatsapp", SITE.whatsapp);

  const categories = Array.from(new Set(packages.map((p) => p.category)));

  return (
    <>
      <section className="container-page pt-16 pb-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
            {getSetting(settings, "fleet_hero_eyebrow", "Pricing")}
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-navy tracking-tight">
            {getSetting(settings, "fleet_hero_title", "Painting & sofa cleaning prices.")}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            {getSetting(
              settings,
              "fleet_hero_subtitle",
              "Starting prices for our most popular jobs. Send photos for a fixed quote — the price we agree is the price you pay.",
            )}
          </p>
        </div>
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-accent/60 p-4 text-sm text-navy max-w-3xl">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            Painting prices include paint, two coats, crack filling and furniture covering. Final
            prices depend on wall condition, ceiling height and colour changes (dark to light needs
            an extra coat).
          </p>
        </div>
      </section>

      {packages.length === 0 ? (
        <section className="container-page py-16">
          <div className="rounded-3xl border border-dashed border-border p-16 text-center">
            <p className="text-muted-foreground">Price list coming soon — message us for a quote.</p>
          </div>
        </section>
      ) : (
        categories.map((cat) => {
          const isPaint = cat.toLowerCase().includes("paint");
          const Icon = isPaint ? PaintRoller : Sofa;
          return (
            <section key={cat} className="container-page py-12">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl gradient-brand text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy">{cat}</h2>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {packages
                  .filter((p) => p.category === cat)
                  .map((p) => (
                    <article
                      key={p.id}
                      className="group rounded-3xl bg-card border border-border shadow-card hover-lift overflow-hidden flex flex-col"
                    >
                      {p.image_url ? (
                        <div className="aspect-[16/10] overflow-hidden bg-muted">
                          <img
                            src={p.image_url}
                            alt={p.alt_text || p.name}
                            loading="lazy"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      ) : null}
                      <div className="p-6 flex-1 flex flex-col gap-4">
                        <h3 className="font-display text-lg font-semibold text-navy">{p.name}</h3>
                        {p.starting_price != null && (
                          <div>
                            <span className="text-xs uppercase tracking-wider text-muted-foreground">From </span>
                            <span className="font-display text-3xl font-bold text-primary">
                              {p.currency ?? "AED"} {Number(p.starting_price).toLocaleString("en-US")}
                            </span>
                          </div>
                        )}
                        <dl className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <dt className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <Ruler className="h-3 w-3" /> Size
                            </dt>
                            <dd className="mt-1 font-semibold text-navy">{p.capacity}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Time
                            </dt>
                            <dd className="mt-1 font-semibold text-navy">{p.temp_range}</dd>
                          </div>
                        </dl>
                        <p className="flex items-start gap-2 text-sm text-navy">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" /> {p.volume}
                        </p>
                        <p className="text-xs text-muted-foreground">Ideal for: {p.ideal}</p>
                        {p.related_link_url && (
                          <a
                            href={p.related_link_url}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-1.5 transition-all"
                          >
                            {p.related_link_label || "Learn more"} <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <a
                          href={whatsappLink(whatsapp, `Hello ${SITE.name}, I'd like to book: ${p.name}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto inline-flex items-center justify-between rounded-xl bg-navy text-white px-4 py-3 text-sm font-semibold hover:bg-primary transition-colors"
                        >
                          Book on WhatsApp <WhatsAppIcon className="h-4 w-4" />
                        </a>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          );
        })
      )}

      <section className="container-page py-8">
        <div className="rounded-3xl gradient-brand text-white p-8 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-bold">Need something not listed?</h2>
            <p className="mt-1 text-white/85">Offices, shops, exterior walls, curtains, carpets — we'll price it for you.</p>
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-6 py-3 text-sm font-semibold">
            Get a custom quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <FaqSection faqs={faqs} eyebrow="FAQ" title="Pricing questions, answered." />
    </>
  );
}
