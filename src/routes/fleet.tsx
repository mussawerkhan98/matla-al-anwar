import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Truck, Snowflake, Ruler, ThermometerSnowflake, ArrowRight } from "lucide-react";
import { listFleetPublic } from "@/lib/fleet.functions";
import { canonicalUrl } from "@/lib/site";
import { siteImagesQuery, pickImage } from "@/lib/site-images.query";
import { listFaqsPublic } from "@/lib/faqs.functions";
import { FaqSection } from "@/components/FaqSection";
import { settingsQuery, getSetting } from "@/lib/settings.query";
import fleetImg from "@/assets/fleet-lineup.jpg";

const fleetFaqsQuery = () =>
  queryOptions({
    queryKey: ["faqs", "list", "fleet"],
    queryFn: () => listFaqsPublic({ data: { page: "fleet" } }),
  });

const fleetQuery = () =>
  queryOptions({ queryKey: ["fleet", "list"], queryFn: () => listFleetPublic() });

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "Our Fleet | Chiller Vans, Freezer Trucks & Pickups | Matla Al Anwar UAE" },
      {
        name: "description",
        content:
          "Explore Matla Al Anwar's UAE chiller and freezer fleet — Toyota Hiace, Nissan Urvan, 1 ton pickup chillers, 3 & 5 ton chiller trucks, and deep-freeze trucks from +8°C to −25°C.",
      },
      {
        property: "og:title",
        content: "Matla Al Anwar Refrigerated Fleet — Chiller Vans, Freezer Trucks & Pickups",
      },
      {
        property: "og:description",
        content:
          "Modern refrigerated fleet across the UAE. Chiller vans, freezer trucks and pickup chillers with continuous temperature monitoring.",
      },
      { property: "og:url", content: canonicalUrl("/fleet") },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/fleet") }],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(fleetQuery()),
      context.queryClient.ensureQueryData(siteImagesQuery()),
      context.queryClient.ensureQueryData(fleetFaqsQuery()),
      context.queryClient.ensureQueryData(settingsQuery()),
    ]),
  component: FleetPage,
});

function FleetPage() {
  const { data: fleet } = useSuspenseQuery(fleetQuery());
  const { data: images } = useSuspenseQuery(siteImagesQuery());
  const { data: faqs = [] } = useSuspenseQuery(fleetFaqsQuery());
  const { data: settings } = useSuspenseQuery(settingsQuery());
  const hero = pickImage(images, "fleet_lineup", {
    src: fleetImg,
    alt: "Matla Al Anwar refrigerated fleet lineup",
  });

  return (
    <>
      <section className="container-page pt-16 pb-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
            {getSetting(settings, "fleet_hero_eyebrow", "Our Fleet")}
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-navy tracking-tight">
            {getSetting(settings, "fleet_hero_title", "Matched to your cargo. Ready around the clock.")}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            {getSetting(
              settings,
              "fleet_hero_subtitle",
              "Compact chiller vans for city routes. Freezer trucks for deep-freeze cargo. Every vehicle temperature-mapped and continuously monitored.",
            )}
          </p>
        </div>
        <img
          src={hero.src}
          alt={hero.alt}
          width={1600}
          height={900}
          loading="lazy"
          className="mt-10 rounded-3xl shadow-elegant w-full"
        />
      </section>

      <section className="container-page py-16">
        {fleet.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-16 text-center">
            <p className="text-muted-foreground">Fleet details coming soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fleet.map((v) => (
              <article
                key={v.id}
                className="group rounded-3xl bg-card border border-border shadow-card hover-lift overflow-hidden flex flex-col"
              >
                {v.image_url ? (
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={v.image_url}
                      alt={v.alt_text || `${v.name} — ${v.category} refrigerated van`}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                ) : null}
                <div className="relative p-6 bg-gradient-to-br from-accent to-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      {v.category}
                    </span>
                    <Truck className="h-6 w-6 text-primary/70" />
                  </div>
                  <h2 className="mt-3 font-display text-xl font-semibold text-navy">{v.name}</h2>
                </div>
                <div className="p-6 flex-1 flex flex-col gap-4">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Snowflake className="h-3 w-3" /> Temp
                      </dt>
                      <dd className="mt-1 font-semibold text-primary">{v.temp_range}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <ThermometerSnowflake className="h-3 w-3" /> Payload
                      </dt>
                      <dd className="mt-1 font-semibold text-navy">{v.capacity}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Ruler className="h-3 w-3" /> Volume
                      </dt>
                      <dd className="mt-1 font-semibold text-navy">{v.volume}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground uppercase tracking-wider">
                        Ideal for
                      </dt>
                      <dd className="mt-1 text-navy text-xs leading-snug">{v.ideal}</dd>
                    </div>
                  </dl>
                  {v.starting_price != null && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Starting from </span>
                      <span className="font-bold text-primary">
                        {v.currency ?? "AED"} {v.starting_price}
                      </span>
                      <span className="text-muted-foreground">/day</span>
                    </p>
                  )}
                  {v.related_link_url && (
                    <a
                      href={v.related_link_url}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-1.5 transition-all"
                    >
                      {v.related_link_label || "Learn more"} <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <Link
                    to="/contact"
                    className="mt-auto inline-flex items-center justify-between rounded-xl bg-navy text-white px-4 py-3 text-sm font-semibold hover:bg-primary transition-colors"
                  >
                    Request this vehicle <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <FaqSection faqs={faqs} eyebrow="FAQ" title="Fleet questions, answered." />
    </>
  );
}
