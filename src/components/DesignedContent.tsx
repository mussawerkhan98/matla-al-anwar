import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin, Plus, Snowflake } from "lucide-react";
import { parseContent, type ContentSection } from "@/lib/content-sections";
import { BRAND } from "@/lib/page-brand";
import { WaGlyph } from "@/components/WaGlyph";

/**
 * Matla Al Anwar "light & icy" rendering of service/industry page content.
 * Same content format as the admin page builder; only the look differs.
 */
export const PROSE =
  "text-[16px] leading-7 text-foreground/80 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_p:empty]:hidden " +
  "[&_a]:text-primary [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-secondary/50 hover:[&_a]:decoration-primary " +
  "[&_strong]:text-navy [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1.5 [&_ul]:marker:text-secondary " +
  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1.5 [&_h4]:font-semibold [&_h4]:text-navy [&_h4]:mt-5 [&_h4]:mb-2 " +
  "[&_img]:rounded-2xl [&_img]:my-6 [&_img]:w-full [&_blockquote]:border-l-4 [&_blockquote]:border-secondary [&_blockquote]:pl-4 [&_blockquote]:italic " +
  "[&_table]:w-full [&_table]:my-4 [&_table]:text-sm [&_th]:bg-accent [&_th]:text-left [&_th]:font-semibold [&_th]:text-navy [&_th]:p-2.5 [&_td]:border-b [&_td]:border-sky-100 [&_td]:p-2.5";

export const FROST = "bg-white/80 backdrop-blur ring-1 ring-sky-100 shadow-[0_14px_40px_-24px_rgba(0,87,217,0.45)]";

const KICKER: Record<ContentSection["kind"], string> = {
  cards: "Key points",
  steps: "Step by step",
  faq: "Good to know",
  areas: "Coverage",
  prose: "Details",
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
export const sectionId = (title: string, i: number) => `sec-${i + 1}-${slug(title) || "section"}`;

/** Section list for the "On this page" menu. */
export function contentToc(html: string | null | undefined) {
  return parseContent(html).sections.map((s, i) => ({ id: sectionId(s.title, i), title: s.title }));
}

function Heading({ title, kind }: { title: string; kind: ContentSection["kind"] }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
        <Snowflake className="h-3.5 w-3.5 text-secondary" /> {KICKER[kind]}
      </div>
      {title && <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-navy sm:text-[30px]">{title}</h2>}
      <div className="mt-3 h-1 w-14 rounded-full gradient-brand" />
    </div>
  );
}

function Html({ html, className = "" }: { html: string; className?: string }) {
  if (!html) return null;
  return <div className={`${PROSE} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

function CardItem({ html }: { html: string }) {
  const onlyLink = html.trim().match(/^<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>$/i);
  if (onlyLink && onlyLink[1].startsWith("/")) {
    return (
      <a
        href={onlyLink[1]}
        className={`group flex h-full items-center justify-between gap-3 rounded-2xl p-4 pl-5 transition-all hover:-translate-y-0.5 hover:ring-secondary ${FROST}`}
      >
        <span className="font-semibold text-navy group-hover:text-primary" dangerouslySetInnerHTML={{ __html: onlyLink[2] }} />
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-white">
          <ArrowRight className="h-4 w-4" />
        </span>
      </a>
    );
  }
  const titled = html.trim().match(/^<strong>([\s\S]*?)<\/strong>\s*([\s\S]*)$/i);
  const hasText = !!titled && !!titled[2].replace(/<[^>]+>/g, "").trim();
  return (
    <div className={`relative h-full overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-0.5 ${FROST}`}>
      <div className="absolute inset-x-0 top-0 h-1 gradient-brand opacity-60" aria-hidden />
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-primary ring-1 ring-sky-100">
        <Snowflake className="h-4 w-4" />
      </span>
      {hasText && titled ? (
        <>
          <div className="mt-3 font-display font-semibold leading-6 text-navy" dangerouslySetInnerHTML={{ __html: titled[1].trim().replace(/:\s*$/, "") }} />
          <div
            className={`${PROSE} mt-1 !text-[14.5px] !leading-6 !text-muted-foreground`}
            dangerouslySetInnerHTML={{ __html: titled[2].replace(/^[:\-–—]\s*/, "") }}
          />
        </>
      ) : (
        <div className={`${PROSE} mt-3 !text-[15px] !leading-6 !text-navy/90`} dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  );
}

function SectionBlock({ section }: { section: ContentSection }) {
  switch (section.kind) {
    case "cards":
      return (
        <>
          <Heading title={section.title} kind="cards" />
          {section.lead && <Html html={section.lead} className="mt-5" />}
          <div className={`mt-6 grid gap-4 sm:grid-cols-2 ${section.items.length > 4 ? "xl:grid-cols-3" : ""}`}>
            {section.items.map((it, i) => (
              <CardItem key={i} html={it} />
            ))}
          </div>
          {section.after && <Html html={section.after} className="mt-6" />}
        </>
      );
    case "steps":
      return (
        <>
          <Heading title={section.title} kind="steps" />
          {section.lead && <Html html={section.lead} className="mt-5" />}
          <ol className="relative mt-7 space-y-5 before:absolute before:bottom-8 before:left-[19px] before:top-8 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-secondary/30">
            {section.items.map((it, i) => (
              <li key={i} className="relative flex gap-5">
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-brand font-display text-sm font-bold text-white shadow-elegant ring-4 ring-white">
                  {i + 1}
                </span>
                <div className={`flex-1 rounded-2xl p-4 ${FROST}`}>
                  <div className={`${PROSE} !text-[15px] !leading-6`} dangerouslySetInnerHTML={{ __html: it }} />
                </div>
              </li>
            ))}
          </ol>
          {section.after && <Html html={section.after} className="mt-6" />}
        </>
      );
    case "faq":
      return (
        <>
          <Heading title={section.title} kind="faq" />
          <div className="mt-6 space-y-3">
            {section.items.map((f, i) => (
              <details key={i} className={`group rounded-2xl ${FROST}`} open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-navy [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary transition-transform group-open:rotate-45">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <Html html={f.a} className="px-5 pb-5 !text-[15px]" />
              </details>
            ))}
          </div>
        </>
      );
    case "areas":
      return (
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-accent via-white to-accent p-6 ring-1 ring-sky-100 sm:p-8">
          <Snowflake className="absolute -right-6 -top-6 h-40 w-40 text-secondary/10" aria-hidden />
          <Heading title={section.title} kind="areas" />
          <div className="relative mt-6 flex flex-wrap gap-2.5">
            {section.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy ring-1 ring-sky-200 transition-colors hover:bg-primary hover:text-white hover:ring-primary"
              >
                <MapPin className="h-3.5 w-3.5 text-secondary" /> {l.label}
              </a>
            ))}
          </div>
          <p className="relative mt-5 text-sm text-muted-foreground">{BRAND.areasNote}</p>
        </div>
      );
    default:
      return (
        <>
          {section.title && <Heading title={section.title} kind="prose" />}
          <div className={`mt-5 rounded-2xl p-6 ${FROST}`}>
            <Html html={section.html} />
          </div>
        </>
      );
  }
}

/** Renders admin content as light, frosted sections. Section ids match contentToc(). */
export function DesignedContent({ html, pageTitle }: { html: string | null | undefined; pageTitle?: string }) {
  const { heading, tagline, intro, sections } = parseContent(html);
  const showHeading = heading && heading.toLowerCase() !== (pageTitle ?? "").trim().toLowerCase();
  return (
    <div className="space-y-16">
      {(tagline || intro || showHeading) && (
        <div>
          {tagline && (
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary ring-1 ring-sky-200">
              <Snowflake className="h-3.5 w-3.5" /> {tagline}
            </div>
          )}
          {showHeading && <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-navy sm:text-[30px]">{heading}</h2>}
          {intro && (
            <div className="mt-5 border-l-4 border-secondary pl-5 sm:pl-6">
              <Html html={intro} className="!text-[17.5px] !leading-8 !text-navy/80" />
            </div>
          )}
        </div>
      )}
      {sections.map((s, i) => (
        <section key={i} id={sectionId(s.title, i)} className="scroll-mt-28">
          <SectionBlock section={s} />
        </section>
      ))}
    </div>
  );
}

/** Compact frosted contact card. */
export function QuoteSidebar({
  phone,
  whatsappHref,
  title,
}: {
  phone: string;
  whatsappHref: string;
  title: string;
  links?: { href: string; label: string; active?: boolean }[];
  linksTitle?: string;
}) {
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  return (
    <div className={`overflow-hidden rounded-3xl ${FROST}`}>
      <div className="relative bg-gradient-to-br from-accent to-white px-5 pb-4 pt-5">
        <Snowflake className="absolute right-3 top-3 h-10 w-10 text-secondary/20" aria-hidden />
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Free quote</div>
        <div className="mt-1 pr-8 font-display text-lg font-bold leading-snug text-navy">{title}</div>
      </div>
      <div className="space-y-2.5 p-5 pt-3">
        <Link to="/contact" className="flex items-center justify-center gap-2 rounded-xl gradient-brand px-4 py-3 text-sm font-semibold text-white shadow-elegant hover-lift">
          Get a quote <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366]/10 px-4 py-3 text-sm font-semibold text-[#128C7E] ring-1 ring-[#25D366]/30 hover:bg-[#25D366]/20"
        >
          <WaGlyph className="h-4 w-4" /> WhatsApp
        </a>
        <a href={phoneHref} className="flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-navy ring-1 ring-sky-200 hover:bg-accent">
          {phone}
        </a>
        <ul className="space-y-1.5 pt-2 text-xs text-muted-foreground">
          {BRAND.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-secondary" /> {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
