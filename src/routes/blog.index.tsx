import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPublishedPosts } from "@/lib/blog.functions";
import { listFaqsPublic } from "@/lib/faqs.functions";
import { FaqSection } from "@/components/FaqSection";
import { canonicalUrl } from "@/lib/site";
import { settingsQuery, getSetting } from "@/lib/settings.query";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

const postsQuery = () =>
  queryOptions({ queryKey: ["blog", "list"], queryFn: () => listPublishedPosts() });
const blogFaqsQuery = () =>
  queryOptions({
    queryKey: ["faqs", "list", "blog"],
    queryFn: () => listFaqsPublic({ data: { page: "blog" } }),
  });

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Painting & Sofa Care Tips | Matla Al Anwar Blog" },
      { name: "description", content: "Painting guides, colour ideas, paint costs and sofa cleaning tips for UAE homes — from the Matla Al Anwar team." },
      { property: "og:title", content: "Matla Al Anwar Blog — Painting & sofa care tips" },
      { property: "og:description", content: "Painting and sofa care tips for UAE homes." },
      { property: "og:url", content: canonicalUrl("/blog") },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/blog") }],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(postsQuery()),
      context.queryClient.ensureQueryData(blogFaqsQuery()),
      context.queryClient.ensureQueryData(settingsQuery()),
    ]),
  component: BlogIndex,
  errorComponent: ({ error }) => <div className="container-page py-16 text-center text-muted-foreground">{error instanceof Error ? error.message : String(error)}</div>,
  notFoundComponent: () => <div className="container-page py-16 text-center">No posts.</div>,
});

function BlogIndex() {
  const { data: posts } = useSuspenseQuery(postsQuery());
  const { data: faqs = [] } = useSuspenseQuery(blogFaqsQuery());
  const { data: settings } = useSuspenseQuery(settingsQuery());

  return (
    <>
      <section className="container-page pt-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
            {getSetting(settings, "blog_hero_eyebrow", "Insights")}
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-navy tracking-tight">
            {getSetting(settings, "blog_hero_title", "Painting & sofa care tips")}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            {getSetting(
              settings,
              "blog_hero_subtitle",
              "Practical guides, industry updates and behind-the-scenes stories from the Matla Al Anwar team.",
            )}
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-16 text-center">
            <p className="text-muted-foreground">No articles published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group rounded-3xl border border-border bg-card overflow-hidden shadow-card hover-lift flex flex-col"
              >
                {p.cover_image_url ? (
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={p.cover_image_url}
                      alt={p.cover_image_alt || p.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/10] gradient-brand" />
                )}
                <div className="p-6 flex flex-col flex-1">
                  {p.published_at && (
                    <time className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      {format(new Date(p.published_at), "PP")}
                    </time>
                  )}
                  <h2 className="mt-2 font-display text-xl font-semibold text-navy group-hover:text-primary transition-colors">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{p.excerpt}</p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                    Read article <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <FaqSection faqs={faqs} eyebrow="FAQ" title="Common questions about our blog." />
    </>
  );
}
