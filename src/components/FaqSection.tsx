import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { listFaqsPublic } from "@/lib/faqs.functions";

type Faq = Awaited<ReturnType<typeof listFaqsPublic>>[number];

/**
 * Reusable FAQ block for any page. Renders nothing if there are no FAQs
 * tagged for this page yet, so it never shows an empty/awkward section.
 */
export function FaqSection({
  faqs,
  eyebrow = "FAQ",
  title = "Answers, before you ask.",
  desc,
  seeAllHref = "/faq",
  limit,
}: {
  faqs: Faq[];
  eyebrow?: string;
  title?: string;
  desc?: string;
  seeAllHref?: string | null;
  limit?: number;
}) {
  if (faqs.length === 0) return null;
  const shown = limit ? faqs.slice(0, limit) : faqs;

  return (
    <section className="container-page py-24">
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
            {eyebrow}
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-navy tracking-tight">
            {title}
          </h2>
          {desc && <p className="mt-4 text-muted-foreground leading-relaxed">{desc}</p>}
          {seeAllHref && (
            <Link
              to={seeAllHref}
              className="mt-6 inline-flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all"
            >
              See all FAQs <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="lg:col-span-2 divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
          {shown.map((f) => (
            <details key={f.id} className="group p-6">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-display font-semibold text-navy list-none">
                {f.question}
                <span className="h-8 w-8 shrink-0 rounded-full bg-accent text-primary flex items-center justify-center transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
