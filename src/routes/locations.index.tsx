import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, ArrowRight, Clock } from "lucide-react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { locationsQuery } from "@/lib/locations.query";
import { listFaqsPublic } from "@/lib/faqs.functions";
import { FaqSection } from "@/components/FaqSection";
import { canonicalUrl } from "@/lib/site";
import { UAEMap } from "@/components/UAEMap";
import { settingsQuery, getSetting } from "@/lib/settings.query";

const locationsFaqsQuery = () =>
  queryOptions({
    queryKey: ["faqs", "list", "locations"],
    queryFn: () => listFaqsPublic({ data: { page: "locations" } }),
  });

export const Route = createFileRoute("/locations/")({
  head: () => ({
    meta: [
      { title: "Areas We Serve | Painting & Sofa Cleaning in All 7 Emirates — Matla Al Anwar" },
      { name: "description", content: "Matla Al Anwar painting and sofa cleaning services in Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain." },
      { property: "og:title", content: "Areas We Serve — Matla Al Anwar Painting & Sofa Cleaning" },
      { property: "og:description", content: "Painting and sofa cleaning in all seven emirates, with same-day slots in Dubai, Sharjah and Ajman." },
      { property: "og:url", content: canonicalUrl("/locations") },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/locations") }],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(locationsQuery()),
      context.queryClient.ensureQueryData(locationsFaqsQuery()),
      context.queryClient.ensureQueryData(settingsQuery()),
    ]),
  component: LocationsPage,
});

function LocationsPage() {
  const { data: CITIES } = useSuspenseQuery(locationsQuery());
  const { data: faqs = [] } = useSuspenseQuery(locationsFaqsQuery());
  const { data: settings } = useSuspenseQuery(settingsQuery());

  return (
    <>
      <section className="container-page pt-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
            {getSetting(settings, "locations_hero_eyebrow", "Areas")}
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-navy tracking-tight">
            {getSetting(settings, "locations_hero_title", "Painting & sofa cleaning in every emirate.")}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            {getSetting(
              settings,
              "locations_hero_subtitle",
              "Tap any emirate to see the neighbourhoods we cover, availability and local prices.",
            )}
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        <UAEMap cities={CITIES} />
      </section>

      <section className="container-page pb-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((c) => (
            <Link
              key={c.slug}
              to="/locations/$city"
              params={{ city: c.slug }}
              className="group rounded-3xl border border-border bg-card p-6 shadow-card hover-lift flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl gradient-brand text-white flex items-center justify-center">
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="text-xs text-muted-foreground font-medium" dir="rtl">{c.arabic}</span>
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold text-navy">{c.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{c.blurb}</p>
              <div className="mt-5 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-primary font-semibold">
                  <Clock className="h-3.5 w-3.5" /> {c.response_time}
                </span>
                <span className="inline-flex items-center gap-1 text-navy font-semibold group-hover:gap-2 transition-all">
                  View <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <FaqSection faqs={faqs} eyebrow="FAQ" title="Area questions, answered." />
    </>
  );
}
