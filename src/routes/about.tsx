import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Snowflake, Shield, Award, Target, Heart, Truck } from "lucide-react";
import { SITE, STATS, canonicalUrl } from "@/lib/site";
import interior from "@/assets/cold-chain-interior.jpg";
import { siteImagesQuery, pickImage } from "@/lib/site-images.query";
import { settingsQuery, getSetting } from "@/lib/settings.query";
import { pageContentQuery, contentForSection } from "@/lib/page-content.query";
import { getIcon } from "@/lib/icon-map";
import { listFaqsPublic } from "@/lib/faqs.functions";
import { FaqSection } from "@/components/FaqSection";

const aboutFaqsQuery = () =>
  queryOptions({
    queryKey: ["faqs", "list", "about"],
    queryFn: () => listFaqsPublic({ data: { page: "about" } }),
  });

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Matla Al Anwar Chiller Van Transport | UAE Cold-Chain Specialists" },
      {
        name: "description",
        content:
          "Learn about Matla Al Anwar Chiller Van Transport LLC — a UAE cold-chain logistics company delivering refrigerated transport with precision, compliance and 24/7 dispatch.",
      },
      { property: "og:title", content: "About Matla Al Anwar Chiller Van Transport" },
      {
        property: "og:description",
        content:
          "UAE cold-chain specialists. Modern refrigerated fleet, HACCP-aligned operations, 24/7 dispatch across all seven emirates.",
      },
      { property: "og:url", content: canonicalUrl("/about") },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/about") }],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(siteImagesQuery()),
      context.queryClient.ensureQueryData(settingsQuery()),
      context.queryClient.ensureQueryData(pageContentQuery("about")),
      context.queryClient.ensureQueryData(aboutFaqsQuery()),
    ]),
  component: About,
});

function About() {
  const { data: images } = useSuspenseQuery(siteImagesQuery());
  const { data: settings } = useSuspenseQuery(settingsQuery());
  const { data: pageContent = [] } = useSuspenseQuery(pageContentQuery("about"));
  const { data: faqs = [] } = useSuspenseQuery(aboutFaqsQuery());
  const interiorImg = pickImage(images, "cold_chain_interior", {
    src: interior,
    alt: "Refrigerated cargo compartment interior",
  });

  const heroTitle = getSetting(
    settings,
    "about_hero_title",
    "The cold-chain partner behind the UAE's most demanding brands.",
  );
  const heroSubtitle = getSetting(
    settings,
    "about_hero_subtitle",
    `${SITE.name} operates a modern refrigerated fleet across all seven emirates, moving food, pharma, seafood, floral and specialty cold cargo with precision and compliance.`,
  );
  const storyP1 = getSetting(
    settings,
    "about_story_p1",
    `${SITE.name} was founded to solve a persistent problem for UAE businesses: cold-chain transport that's actually reliable. Too many promises, too many broken temperature logs, too many spoiled loads.`,
  );
  const storyP2 = getSetting(
    settings,
    "about_story_p2",
    "Today we run a fleet of chiller vans, freezer trucks and pickup chillers — dispatched around the clock by a team that understands food safety, pharmaceutical handling and last-mile logistics as deeply as they understand vehicles.",
  );
  const storyP3 = getSetting(
    settings,
    "about_story_p3",
    "We serve restaurants, hotels, hospitals, supermarkets, floral studios, catering companies and manufacturers from Abu Dhabi to Ras Al Khaimah — and everywhere in between.",
  );
  const stats = [1, 2, 3, 4].map((n) => ({
    value: getSetting(settings, `stat_${n}_value`, STATS[n - 1]?.value ?? ""),
    label: getSetting(settings, `stat_${n}_label`, STATS[n - 1]?.label ?? ""),
  }));
  const cmsValues = contentForSection(pageContent, "about_values");
  const values =
    cmsValues.length > 0
      ? cmsValues.map((row) => ({ icon: getIcon(row.icon), title: row.heading, desc: row.body }))
      : [
          {
            icon: Snowflake,
            title: "Cold-chain obsession",
            desc: "Every trip is planned around the temperature envelope your cargo needs.",
          },
          {
            icon: Shield,
            title: "Compliance-first",
            desc: "Municipality permits, HACCP-aligned protocols, GDP-aware pharma handling.",
          },
          {
            icon: Target,
            title: "On-time, every time",
            desc: "Route planning, live tracking and slot-based deliveries you can build around.",
          },
          {
            icon: Heart,
            title: "Customer-obsessed",
            desc: "24/7 humans on WhatsApp. Real answers, not chatbots.",
          },
        ];
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent via-white to-accent" />
        <div className="container-page py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            About us
          </div>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-navy tracking-tight max-w-3xl mx-auto">
            {heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            {heroSubtitle}
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-card border border-border p-6 text-center shadow-card"
            >
              <div className="font-display text-3xl font-bold gradient-text">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <img
            src={interiorImg.src}
            alt={interiorImg.alt}
            width={1280}
            height={960}
            loading="lazy"
            className="rounded-3xl shadow-elegant w-full"
          />
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy">Our story</h2>
            <div className="mt-5 space-y-4 text-muted-foreground leading-relaxed">
              <p>{storyP1}</p>
              <p>{storyP2}</p>
              <p>{storyP3}</p>
            </div>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full gradient-brand text-white px-6 py-3 text-sm font-semibold shadow-elegant hover-lift"
            >
              Work with us
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy max-w-xl">
          What we stand for.
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-card hover-lift"
            >
              <div className="h-12 w-12 rounded-xl gradient-brand flex items-center justify-center text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display font-semibold text-navy">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <FaqSection faqs={faqs} eyebrow="FAQ" title="Questions about Matla Al Anwar?" />

      <section className="container-page py-16">
        <div className="rounded-3xl bg-navy text-white p-10 sm:p-14 flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div className="flex items-start gap-4 max-w-xl">
            <Award className="h-10 w-10 text-secondary shrink-0" />
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                Licensed. Insured. Trusted.
              </h2>
              <p className="mt-2 text-ice/80">
                Registered as an LLC in the UAE with full commercial licensing, cargo insurance and
                municipality-approved refrigerated transport.
              </p>
            </div>
          </div>
          <Link
            to="/fleet"
            className="inline-flex items-center gap-2 rounded-full bg-white text-navy px-6 py-3 text-sm font-semibold hover:bg-ice"
          >
            <Truck className="h-4 w-4" /> See the fleet
          </Link>
        </div>
      </section>
    </>
  );
}
