import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Sparkles, Shield, Award, Target, Heart, Tag } from "lucide-react";
import { SITE, STATS, canonicalUrl } from "@/lib/site";
import interior from "@/assets/finished-room.jpg";
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
      { title: "About Matla Al Anwar | Painting & Sofa Cleaning Company in the UAE" },
      {
        name: "description",
        content:
          "Meet Matla Al Anwar — a UAE painting and sofa cleaning company serving homes, villas and businesses in all seven emirates with fixed prices, premium materials and a careful, trained team.",
      },
      { property: "og:title", content: "About Matla Al Anwar — Painting & Sofa Cleaning UAE" },
      {
        property: "og:description",
        content:
          "Painting and sofa cleaning specialists for homes and businesses across the UAE.",
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
  const interiorImg = pickImage(images, "finished_room", {
    src: interior,
    alt: "Freshly painted living room with a deep-blue feature wall",
  });

  const heroTitle = getSetting(
    settings,
    "about_hero_title",
    "Making UAE homes look and feel new again.",
  );
  const heroSubtitle = getSetting(
    settings,
    "about_hero_subtitle",
    `${SITE.name} is a painting and sofa cleaning company serving apartments, villas, offices and holiday homes across all seven emirates.`,
  );
  const storyP1 = getSetting(
    settings,
    "about_story_p1",
    `${SITE.name} started with a simple idea: home services in the UAE should be on time, clearly priced and done to a standard you'd be proud to show guests. Too many people had been let down by patchy paint jobs, surprise charges and sofas that came back wetter than they were clean.`,
  );
  const storyP2 = getSetting(
    settings,
    "about_story_p2",
    "Today our trained painters and upholstery cleaners work with premium paints from Jotun, National Paints and Dulux and professional hot-water extraction machines — covering every floor and piece of furniture before work starts and leaving every room tidy when we finish.",
  );
  const storyP3 = getSetting(
    settings,
    "about_story_p3",
    "We help families moving in or out, landlords and property managers, holiday-home operators, offices, cafés and clinics from Abu Dhabi to Ras Al Khaimah — and everywhere in between.",
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
            icon: Sparkles,
            title: "A finish we're proud of",
            desc: "Straight lines, even coats and fabrics that look and smell fresh again.",
          },
          {
            icon: Shield,
            title: "Respect for your home",
            desc: "Furniture, floors and fittings covered and protected on every job.",
          },
          {
            icon: Target,
            title: "On-time, every time",
            desc: "We arrive in the slot we booked and finish on the day we promised.",
          },
          {
            icon: Heart,
            title: "Honest pricing",
            desc: "A fixed quote up front. No surprise charges when the job is done.",
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
                Clear prices. Careful work.
              </h2>
              <p className="mt-2 text-ice/80">
                See our starting prices for apartment and villa painting, sofa, majlis and mattress
                cleaning — then send photos for a fixed quote.
              </p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-full bg-white text-navy px-6 py-3 text-sm font-semibold hover:bg-ice"
          >
            <Tag className="h-4 w-4" /> See our prices
          </Link>
        </div>
      </section>
    </>
  );
}
