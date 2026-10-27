import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getIndustryBySlug } from "@/lib/industries.functions";
import { canonicalUrl } from "@/lib/site";
import { Building2 } from "lucide-react";
import { DetailLayout } from "@/components/DetailLayout";
import { BRAND } from "@/lib/page-brand";

const industryQuery = (slug: string) =>
  queryOptions({
    queryKey: ["industry", slug],
    queryFn: async () => {
      const industry = await getIndustryBySlug({ data: { slug } });
      if (!industry) throw notFound();
      return industry;
    },
  });

export const Route = createFileRoute("/industries/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(industryQuery(params.slug)),
  head: ({ loaderData }) => {
    const industry = loaderData;
    if (!industry) return { meta: [{ title: "Page not found" }] };
    const title = BRAND.industrySeoTitle(industry.name);
    const description = industry.description || `Painting and sofa cleaning for ${industry.name.toLowerCase()} across the UAE.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonicalUrl(`/industries/${industry.slug}`) },
      ],
      links: [{ rel: "canonical", href: canonicalUrl(`/industries/${industry.slug}`) }],
    };
  },
  component: IndustryDetail,
  errorComponent: ({ error }) => <div className="container-page py-16 text-center text-muted-foreground">{error instanceof Error ? error.message : String(error)}</div>,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-navy">Page not found</h1>
      <Link to="/industries" className="mt-4 inline-block text-primary hover:underline">← Back to who we serve</Link>
    </div>
  ),
});

function IndustryDetail() {
  const { slug } = Route.useParams();
  const { data: industry } = useSuspenseQuery(industryQuery(slug));
  return (
    <DetailLayout
      backTo="/industries"
      backLabel="Who we serve"
      badgeIcon={Building2}
      badge={BRAND.industryBadge}
      title={industry.name}
      description={industry.description}
      imageUrl={industry.image_url}
      imageAlt={industry.image_alt}
      contentHtml={industry.content_html}
      quoteTitle={BRAND.industryQuoteTitle(industry.name)}
      currentPath={`/industries/${industry.slug}`}
    />
  );
}
