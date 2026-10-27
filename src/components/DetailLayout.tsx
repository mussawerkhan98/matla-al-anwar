import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Clock, MapPin, Phone, Snowflake, ThermometerSnowflake, type LucideIcon } from "lucide-react";
import { BRAND } from "@/lib/page-brand";
import { settingsQuery, getSetting } from "@/lib/settings.query";
import { listServicesPublic } from "@/lib/services.functions";
import { DesignedContent, QuoteSidebar, contentToc, FROST } from "@/components/DesignedContent";
import { HeroSnowfall } from "@/components/HeroSnowfall";
import { WaGlyph } from "@/components/WaGlyph";

/**
 * Matla Al Anwar "light & icy" layout for service and industry pages.
 * All text, photos and sections come from the admin panel.
 */
export function DetailLayout({
  backTo,
  backLabel,
  badgeIcon: BadgeIcon,
  badge,
  title,
  description,
  imageUrl,
  imageAlt,
  contentHtml,
  quoteTitle,
  currentPath,
}: {
  backTo: "/services" | "/industries";
  backLabel: string;
  badgeIcon: LucideIcon;
  badge: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  contentHtml?: string | null;
  quoteTitle: string;
  currentPath: string;
}) {
  const { data: settings = {} } = useQuery(settingsQuery());
  const { data: services = [] } = useQuery({ queryKey: ["services", "list"], queryFn: () => listServicesPublic() });
  const phone = getSetting(settings, "site_phone", BRAND.phone);
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const whatsapp = getSetting(settings, "site_whatsapp", BRAND.whatsapp).replace(/[^\d]/g, "");
  const whatsappHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(BRAND.whatsappText)}`;
  const toc = contentToc(contentHtml);
  const more = services
    .filter((s: any) => s.slug && `/services/${s.slug}` !== currentPath)
    .slice(0, 6)
    .map((s: any) => ({ href: `/services/${s.slug}`, label: (s.title as string).replace(/ in Dubai and Across the UAE$/i, ""), text: s.description as string }));
  const chipIcons = [Clock, MapPin, ThermometerSnowflake];

  return (
    <article className="pb-20">
      {/* Hero — bright, icy, centred */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent via-white to-white">
        <HeroSnowfall />
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" aria-hidden />
        <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="container-page relative pt-10 text-center lg:pt-14">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <Link to={backTo} className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 font-medium text-muted-foreground ring-1 ring-sky-100 hover:text-primary">
              <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <BadgeIcon className="h-3.5 w-3.5" /> {badge}
            </span>
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-[34px] font-bold leading-[1.1] tracking-tight text-navy sm:text-5xl lg:text-[56px]">
            {title}
          </h1>
          {description && <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p>}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full gradient-brand px-7 py-3.5 text-sm font-semibold text-white shadow-elegant hover-lift">
              Get a Free Quote <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#128C7E] ring-1 ring-[#25D366]/40 hover:bg-[#25D366]/10">
              <WaGlyph className="h-5 w-5" /> WhatsApp
            </a>
            <a href={phoneHref} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-navy ring-1 ring-sky-200 hover:bg-accent">
              <Phone className="h-4 w-4 text-primary" /> {phone}
            </a>
          </div>

          <div className="relative mx-auto mt-12 max-w-5xl">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-r from-secondary/25 via-white/0 to-primary/20 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-2 ring-1 ring-sky-100 shadow-elegant">
              <img src={imageUrl || BRAND.fallbackImage} alt={imageAlt || title} className="aspect-[16/7] w-full rounded-[1.6rem] object-cover" />
            </div>
            <div className="relative -mt-7 flex flex-wrap justify-center gap-3 px-4">
              {BRAND.highlights.map((label, i) => {
                const Icon = chipIcons[i % chipIcons.length];
                return (
                  <span key={label} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-navy ${FROST}`}>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-primary">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Body — "On this page" menu on the left, content on the right */}
      <div className="container-page mt-16 grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
        <aside className="order-2 space-y-6 lg:order-1 lg:sticky lg:top-28 lg:self-start">
          {toc.length > 1 && (
            <nav className={`hidden rounded-3xl p-5 lg:block ${FROST}`} aria-label="On this page">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                <Snowflake className="h-3.5 w-3.5 text-secondary" /> On this page
              </div>
              <ol className="mt-3 space-y-0.5 border-l-2 border-sky-100">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="-ml-0.5 block border-l-2 border-transparent py-1.5 pl-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                      {t.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <QuoteSidebar phone={phone} whatsappHref={whatsappHref} title={quoteTitle} />
        </aside>
        <div className="order-1 min-w-0 lg:order-2">
          <DesignedContent html={contentHtml} pageTitle={title} />
        </div>
      </div>

      {/* More services */}
      {more.length > 0 && (
        <section className="container-page mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                <Snowflake className="h-3.5 w-3.5 text-secondary" /> Explore more
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-navy sm:text-3xl">More cold-chain services</h2>
            </div>
            <Link to="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              All services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((s) => (
              <a key={s.href} href={s.href} className={`group flex flex-col rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:ring-secondary ${FROST}`}>
                <span className="font-display font-semibold text-navy group-hover:text-primary">{s.label}</span>
                {s.text && <span className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{s.text}</span>}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Learn more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA — light frosted band */}
      <div className="container-page mt-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-accent via-white to-accent p-8 text-center ring-1 ring-sky-100 sm:p-12">
          <Snowflake className="absolute -left-8 -top-8 h-44 w-44 text-secondary/10" aria-hidden />
          <Snowflake className="absolute -bottom-10 -right-6 h-52 w-52 text-primary/10" aria-hidden />
          <h2 className="relative mx-auto max-w-2xl font-display text-2xl font-bold text-navy sm:text-3xl">{quoteTitle}</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-muted-foreground">{BRAND.ctaText}</p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full gradient-brand px-7 py-3.5 text-sm font-semibold text-white shadow-elegant hover-lift">
              Request a Quote <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={phoneHref} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-navy ring-1 ring-sky-200 hover:bg-accent">
              <Phone className="h-4 w-4 text-primary" /> {phone}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
