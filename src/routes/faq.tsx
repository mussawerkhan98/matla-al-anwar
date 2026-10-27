import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listFaqsPublic } from "@/lib/faqs.functions";
import { canonicalUrl } from "@/lib/site";
import { settingsQuery, getSetting } from "@/lib/settings.query";

const faqsQuery = () =>
  queryOptions({ queryKey: ["faqs", "list", "faq"], queryFn: () => listFaqsPublic({ data: { page: "faq" } }) });

export const Route = createFileRoute("/faq")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(faqsQuery()),
      context.queryClient.ensureQueryData(settingsQuery()),
    ]),
  head: ({ loaderData }) => ({
    meta: [
      { title: "FAQ — Painting & Sofa Cleaning Dubai & UAE | Matla Al Anwar" },
      {
        name: "description",
        content:
          "Answers about Matla Al Anwar's painting and sofa cleaning services in the UAE — prices, timings, paint brands, drying times, areas covered and how to book.",
      },
      { property: "og:title", content: "FAQ — Matla Al Anwar Painting & Sofa Cleaning" },
      {
        property: "og:description",
        content: "Answers about our painting and sofa cleaning services across the UAE.",
      },
      { property: "og:url", content: canonicalUrl("/faq") },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/faq") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: (loaderData?.[0] ?? []).map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data: faqs } = useSuspenseQuery(faqsQuery());
  const { data: settings } = useSuspenseQuery(settingsQuery());

  return (
    <section className="container-page py-16">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
          {getSetting(settings, "faq_hero_eyebrow", "FAQ")}
        </div>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold text-navy tracking-tight">
          {getSetting(settings, "faq_hero_title", "Questions, answered.")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {getSetting(
            settings,
            "faq_hero_subtitle",
            "Prices, timings, paint brands, drying times and how booking works — everything you might want to know.",
          )}
        </p>
      </div>

      {faqs.length === 0 ? (
        <div className="mt-10 max-w-3xl rounded-2xl border border-dashed border-border p-16 text-center">
          <p className="text-muted-foreground">FAQs coming soon.</p>
        </div>
      ) : (
        <div className="mt-10 max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden shadow-card">
          {faqs.map((f) => (
            <details key={f.id} className="group p-6">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-lg font-semibold text-navy list-none">
                {f.question}
                <span className="h-8 w-8 shrink-0 rounded-full bg-accent text-primary flex items-center justify-center transition-transform group-open:rotate-45 text-xl leading-none">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
