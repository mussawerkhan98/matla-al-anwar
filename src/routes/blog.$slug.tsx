import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { getPublishedPostBySlug, listPublishedPosts } from "@/lib/blog.functions";
import { listFaqsPublic } from "@/lib/faqs.functions";
import { FaqSection } from "@/components/FaqSection";
import { ReadingProgress, ShareButtons, TocMobile, TocNav } from "@/components/BlogPostUI";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { canonicalUrl, SITE, SITE_URL } from "@/lib/site";
import { settingsQuery, getSetting } from "@/lib/settings.query";
import { extractFaqs, prepareArticle, readingMinutes, stripTags } from "@/lib/blog-article";
import { format } from "date-fns";
import { ArrowRight, CalendarDays, ChevronRight, Clock, Phone, RefreshCw, Snowflake } from "lucide-react";

/** Wording for this site's blog. */
const BLOG = {
  titleSuffix: "Matla Al Anwar",
  section: "Cold-chain insights",
  ctaTitle: "Need refrigerated transport in the UAE?",
  ctaText: "Get an instant chiller van or freezer truck quote — 24/7 dispatch across all seven emirates.",
  moreTitle: "More cold-chain insights",
};

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog", "post", slug],
    queryFn: async () => {
      const post = await getPublishedPostBySlug({ data: { slug } });
      if (!post) throw notFound();
      return post;
    },
  });

const postFaqsQuery = (slug: string) =>
  queryOptions({
    queryKey: ["faqs", "list", "blogPost", slug],
    queryFn: () => listFaqsPublic({ data: { postSlug: slug } }),
  });

const relatedQuery = () => queryOptions({ queryKey: ["blog", "list"], queryFn: () => listPublishedPosts() });

type Post = NonNullable<Awaited<ReturnType<typeof getPublishedPostBySlug>>>;

function postDates(post: Post) {
  const published = post.published_at ? new Date(post.published_at) : null;
  const rawUpdated = (post as { updated_at?: string | null }).updated_at;
  const updated = rawUpdated ? new Date(rawUpdated) : null;
  // Only show "Updated" when it is at least a day after publishing.
  const showUpdated = !!(published && updated && updated.getTime() - published.getTime() > 86_400_000);
  return { published, updated: showUpdated ? updated : null };
}

function buildJsonLd(post: Post, faqs: { question: string; answer: string }[], words: number) {
  const url = canonicalUrl(`/blog/${post.slug}`);
  const { published, updated } = postDates(post);
  const description = post.meta_description || post.excerpt || "";
  const org = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE.name,
    url: `${SITE_URL}/`,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
  };
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: post.title.slice(0, 110),
      description,
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      ...(post.cover_image_url ? { image: [post.cover_image_url] } : {}),
      ...(published ? { datePublished: published.toISOString() } : {}),
      ...(published ? { dateModified: (updated ?? published).toISOString() } : {}),
      author: org,
      publisher: org,
      articleSection: BLOG.section,
      wordCount: words,
      timeRequired: `PT${readingMinutes(words)}M`,
      inLanguage: "en-AE",
      isPartOf: { "@type": "Blog", "@id": `${SITE_URL}/blog#blog`, name: `${SITE.name} Blog`, url: `${SITE_URL}/blog` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];
  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(postQuery(params.slug)),
      context.queryClient.ensureQueryData(postFaqsQuery(params.slug)),
    ]),
  head: ({ loaderData }) => {
    const post = loaderData?.[0];
    if (!post) return { meta: [{ title: "Post not found" }, { name: "robots", content: "noindex" }] };
    const adminFaqs = (loaderData?.[1] ?? []) as { question: string; answer: string }[];
    const url = canonicalUrl(`/blog/${post.slug}`);
    const title = post.meta_title || `${post.title} | ${BLOG.titleSuffix}`;
    const description = post.meta_description || post.excerpt || "";
    const article = prepareArticle(post.content_html, new URL(SITE_URL).hostname);
    const seen = new Set<string>();
    const faqs = [...adminFaqs.map((f) => ({ question: f.question, answer: f.answer })), ...extractFaqs(article.html)].filter((f) => {
      const k = f.question.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const { published, updated } = postDates(post);
    const meta: Record<string, string>[] = [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: "en_AE" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { property: "article:section", content: BLOG.section },
    ];
    if (published) meta.push({ property: "article:published_time", content: published.toISOString() });
    if (published) meta.push({ property: "article:modified_time", content: (updated ?? published).toISOString() });
    if (post.cover_image_url) {
      meta.push(
        { property: "og:image", content: post.cover_image_url },
        { property: "og:image:alt", content: post.cover_image_alt || post.title },
        { name: "twitter:image", content: post.cover_image_url },
      );
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(buildJsonLd(post, faqs, article.words)) }],
    };
  },
  component: BlogPost,
  errorComponent: ({ error }) => (
    <div className="container-page py-16 text-center text-muted-foreground">{error instanceof Error ? error.message : String(error)}</div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-navy">Article not found</h1>
      <Link to="/blog" className="mt-4 inline-block text-primary hover:underline">
        ← Back to blog
      </Link>
    </div>
  ),
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(slug));
  const { data: faqs = [] } = useSuspenseQuery(postFaqsQuery(slug));
  const { data: allPosts = [] } = useQuery(relatedQuery());
  const { data: settings = {} } = useQuery(settingsQuery());

  const article = prepareArticle(post.content_html, new URL(SITE_URL).hostname);
  const { published, updated } = postDates(post);
  const url = canonicalUrl(`/blog/${post.slug}`);
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  const phone = getSetting(settings, "site_phone", SITE.phone);
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const whatsapp = getSetting(settings, "site_whatsapp", SITE.whatsapp).replace(/[^\d]/g, "");
  const whatsappHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello ${SITE.name}, I read "${post.title}" and would like a quote.`)}`;

  return (
    <article className="pb-20">
      <ReadingProgress targetId="post-body" />

      {/* Header */}
      <header className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent/70 via-accent/25 to-transparent">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="container-page relative pb-10 pt-8 sm:pb-12 sm:pt-10">
          <nav aria-label="Breadcrumb" className="text-xs font-medium text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li>
                <Link to="/blog" className="hover:text-primary">
                  Blog
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li className="line-clamp-1 max-w-[16rem] text-navy sm:max-w-md" aria-current="page">
                {post.title}
              </li>
            </ol>
          </nav>

          <div className="mt-7 max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary shadow-sm ring-1 ring-primary/10">
              <Snowflake className="h-3.5 w-3.5" /> {BLOG.section}
            </span>
            <h1 className="mt-4 font-display text-[2rem] font-bold leading-[1.1] tracking-tight text-navy sm:text-5xl lg:text-[3.35rem]">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {post.excerpt}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-border">
                  <img src="/logo.png" alt="" width={40} height={40} className="h-8 w-8 object-contain" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[11px] uppercase tracking-[0.14em]">Written by</span>
                  <span className="font-semibold text-navy">
                    {SITE.name} team
                  </span>
                </span>
              </span>
              {published && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <time dateTime={published.toISOString()}>
                    {format(published, "d MMM yyyy")}
                  </time>
                </span>
              )}
              {updated && (
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw className="h-4 w-4 text-primary" /> Updated{" "}
                  <time dateTime={updated.toISOString()}>
                    {format(updated, "d MMM yyyy")}
                  </time>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" /> {article.minutes} min read
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Cover */}
      {post.cover_image_url && (
        <div className="container-page mt-8 sm:mt-10">
          <figure className="overflow-hidden rounded-3xl bg-muted shadow-elegant ring-1 ring-border">
            <img
              src={post.cover_image_url}
              alt={post.cover_image_alt || post.title}
              width={1600}
              height={800}
              fetchPriority="high"
              className="aspect-[16/9] w-full object-cover sm:aspect-[2/1]"
             
            />
          </figure>
        </div>
      )}

      {/* Body + sidebar */}
      <div className="container-page mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14">
        <div className="min-w-0">
          <TocMobile items={article.toc} />
          <div id="post-body" className="post-prose mx-auto mt-6 max-w-[46rem] lg:mx-0 lg:mt-0" dangerouslySetInnerHTML={{ __html: article.html }} />

          <div className="mx-auto mt-12 max-w-[46rem] border-t border-border pt-6 lg:mx-0">
            <ShareButtons url={url} title={post.title} />
          </div>

          {/* About the publisher (E-E-A-T) */}
          <aside className="mx-auto mt-8 flex max-w-[46rem] gap-4 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6 lg:mx-0">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-border">
              <img src="/logo.png" alt={`${SITE.name} logo`} width={56} height={56} className="h-11 w-11 object-contain" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">About the publisher</p>
              <p className="mt-1 font-display text-lg font-bold text-navy">{SITE.name}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{SITE.description}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                <Link to="/about" className="text-primary hover:underline">
                  About us
                </Link>
                <Link to="/services" className="text-primary hover:underline">
                  Our services
                </Link>
                <Link to="/contact" className="text-primary hover:underline">
                  Contact
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-5">
            <TocNav items={article.toc} />
            <div className="overflow-hidden rounded-2xl gradient-brand p-6 text-white shadow-elegant">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">Free quote</p>
              <p className="mt-2 font-display text-xl font-bold leading-snug">{BLOG.ctaTitle}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/85">{BLOG.ctaText}</p>
              <div className="mt-5 grid gap-2">
                <Link to="/contact" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-primary">
                  Request a quote <ArrowRight className="h-4 w-4" />
                </Link>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/15 text-sm font-bold text-white ring-1 ring-white/30">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </a>
                <a href={phoneHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white/90">
                  <Phone className="h-4 w-4" /> {phone}
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Closing call to action */}
      <section className="container-page mt-16">
        <div className="relative overflow-hidden rounded-3xl gradient-brand px-6 py-10 text-white shadow-elegant sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden />
          <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{BLOG.ctaTitle}</h2>
              <p className="mt-2 max-w-2xl text-white/85">{BLOG.ctaText}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-primary shadow-lg">
                Get a quote <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-white/15 px-6 text-sm font-bold text-white ring-1 ring-white/35">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="container-page mt-20" aria-labelledby="related-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="related-heading" className="font-display text-2xl font-bold text-navy sm:text-3xl">
              {BLOG.moreTitle}
            </h2>
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              All articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => {
              const mins = readingMinutes(stripTags((p as { content_html?: string }).content_html ?? "").split(" ").length);
              return (
                <Link
                  key={p.id}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="post-related group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                >
                  <div className="m-2 mb-0 aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                    {p.cover_image_url ? (
                      <img src={p.cover_image_url} alt={p.cover_image_alt || p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700" />
                    ) : (
                      <div className="h-full w-full gradient-brand" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-medium text-muted-foreground">
                      {p.published_at ? format(new Date(p.published_at), "d MMM yyyy") : ""}
                      {p.published_at ? " · " : ""}
                      {mins} min read
                    </p>
                    <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold leading-snug text-navy transition-colors group-hover:text-primary">{p.title}</h3>
                    {p.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary">
                      Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <FaqSection faqs={faqs} eyebrow="FAQ" title="Frequently asked questions" desc="Common questions about this article, answered." seeAllHref={null} />
    </article>
  );
}
