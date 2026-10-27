import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Building2, ArrowRight, MessageSquareText } from "lucide-react";
import { listIndustriesPublic } from "@/lib/industries.functions";
import { listFaqsPublic } from "@/lib/faqs.functions";
import { FaqSection } from "@/components/FaqSection";
import { canonicalUrl } from "@/lib/site";
import { settingsQuery, getSetting } from "@/lib/settings.query";

const industriesQuery = () =>
  queryOptions({ queryKey: ["industries", "list"], queryFn: () => listIndustriesPublic() });
const industriesFaqsQuery = () =>
  queryOptions({
    queryKey: ["faqs", "list", "industries"],
    queryFn: () => listFaqsPublic({ data: { page: "industries" } }),
  });

export const Route = createFileRoute("/industries/")({
  head: () => ({
    meta: [
      { title: "Industries We Serve | Chiller Van Transport UAE — Matla Al Anwar" },
      { name: "description", content: "Matla Al Anwar serves restaurants, hotels, hospitals, supermarkets, catering, food manufacturing, floral, ice-cream and pharmaceutical clients across the UAE." },
      { property: "og:title", content: "Industries — Matla Al Anwar Chiller Van Transport" },
      { property: "og:description", content: "Cold-chain logistics tailored to UAE hospitality, healthcare, retail and manufacturing." },
      { property: "og:url", content: canonicalUrl("/industries") },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/industries") }],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(industriesQuery()),
      context.queryClient.ensureQueryData(industriesFaqsQuery()),
      context.queryClient.ensureQueryData(settingsQuery()),
    ]),
  component: IndustriesPage,
});

function IndustriesPage() {
  const { data: industries } = useSuspenseQuery(industriesQuery());
  const { data: faqs = [] } = useSuspenseQuery(industriesFaqsQuery());
  const { data: settings } = useSuspenseQuery(settingsQuery());

  return (
    <>
      <section className="container-page pt-16 pb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
            {getSetting(settings, "industries_hero_eyebrow", "Industries")}
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-navy tracking-tight">
            {getSetting(settings, "industries_hero_title", "Trusted across the industries the UAE runs on.")}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            {getSetting(
              settings,
              "industries_hero_subtitle",
              "Cold-chain expectations vary. So do our routes, vehicles and handling protocols — matched to your industry from day one.",
            )}
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        {industries.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-16 text-center">
            <p className="text-muted-foreground">Industry list coming soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((i) => (
              <article
                key={i.id}
                className="group flex flex-col rounded-2xl bg-card border border-border overflow-hidden shadow-card hover-lift"
              >
                {i.image_url ? (
                  <Link
                    to="/industries/$slug"
                    params={{ slug: i.slug }}
                    className="block aspect-[16/10] overflow-hidden bg-muted"
                  >
                    <img
                      src={i.image_url}
                      alt={i.image_alt || i.name}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>
                ) : (
                  <div className="p-6 pb-0">
                    <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-primary">
                      <Building2 className="h-6 w-6" />
                    </div>
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="font-display text-lg font-semibold text-navy">
                    <Link to="/industries/$slug" params={{ slug: i.slug }} className="hover:text-primary transition-colors">
                      {i.name}
                    </Link>
                  </h2>
                  {i.description && (
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                      {i.description}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <Link
                      to="/industries/$slug"
                      params={{ slug: i.slug }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-navy hover:border-primary hover:text-primary transition-colors"
                    >
                      Learn more <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      Get a quote <MessageSquareText className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <FaqSection faqs={faqs} eyebrow="FAQ" title="Industry questions, answered." />
    </>
  );
}
