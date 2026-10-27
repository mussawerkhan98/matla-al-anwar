import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { getIcon } from "@/lib/icon-map";
import { listServicesPublic } from "@/lib/services.functions";
import { listFaqsPublic } from "@/lib/faqs.functions";
import { FaqSection } from "@/components/FaqSection";
import { canonicalUrl } from "@/lib/site";
import { settingsQuery, getSetting } from "@/lib/settings.query";

const servicesQuery = () =>
  queryOptions({ queryKey: ["services", "list"], queryFn: () => listServicesPublic() });
const servicesFaqsQuery = () =>
  queryOptions({
    queryKey: ["faqs", "list", "services"],
    queryFn: () => listFaqsPublic({ data: { page: "services" } }),
  });

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Painting & Sofa Cleaning Services in Dubai & UAE | Matla Al Anwar" },
      {
        name: "description",
        content:
          "Interior & exterior painting, villa and apartment repainting, sofa cleaning, upholstery, majlis, carpet and mattress cleaning across Dubai, Sharjah, Abu Dhabi and all UAE.",
      },
      { property: "og:title", content: "Painting & Sofa Cleaning Services — Matla Al Anwar UAE" },
      {
        property: "og:description",
        content:
          "Professional painting and upholstery cleaning for homes and businesses across the UAE.",
      },
      { property: "og:url", content: canonicalUrl("/services") },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/services") }],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(servicesQuery()),
      context.queryClient.ensureQueryData(servicesFaqsQuery()),
      context.queryClient.ensureQueryData(settingsQuery()),
    ]),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery());
  const { data: faqs = [] } = useSuspenseQuery(servicesFaqsQuery());
  const { data: settings } = useSuspenseQuery(settingsQuery());

  return (
    <>
      <section className="container-page pt-16 pb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
            {getSetting(settings, "services_hero_eyebrow", "Services")}
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-navy tracking-tight">
            {getSetting(settings, "services_hero_title", "Painting and sofa cleaning services, done properly.")}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            {getSetting(
              settings,
              "services_hero_subtitle",
              "Interior and exterior painting for apartments and villas, and deep cleaning for sofas, majlis, mattresses and carpets — all with fixed prices and a trained, uniformed team.",
            )}
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        {services.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-16 text-center">
            <p className="text-muted-foreground">Service list coming soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article
                key={s.id}
                className="group flex flex-col rounded-2xl bg-card border border-border overflow-hidden shadow-card hover-lift"
              >
                {s.image_url ? (
                  <Link
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    className="block aspect-[16/10] overflow-hidden bg-muted"
                  >
                    <img
                      src={s.image_url}
                      alt={s.image_alt || s.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>
                ) : (
                  <div className="p-6 pb-0">
                    <div className="h-12 w-12 rounded-xl gradient-brand text-white flex items-center justify-center">
                      {(() => { const Icon = getIcon(s.icon); return <Icon className="h-6 w-6" />; })()}
                    </div>
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="font-display text-lg font-semibold text-navy">
                    <Link to="/services/$slug" params={{ slug: s.slug }} className="hover:text-primary transition-colors">
                      {s.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                    {s.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <Link
                      to="/services/$slug"
                      params={{ slug: s.slug }}
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

      <FaqSection faqs={faqs} eyebrow="FAQ" title="Service questions, answered." />
    </>
  );
}
