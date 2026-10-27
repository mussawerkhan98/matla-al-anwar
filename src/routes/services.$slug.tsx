import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getServiceBySlug } from "@/lib/services.functions";
import { canonicalUrl, SITE, SITE_URL } from "@/lib/site";
import { PaintRoller } from "lucide-react";
import { DetailLayout } from "@/components/DetailLayout";
import { BRAND } from "@/lib/page-brand";

const serviceQuery = (slug: string) =>
  queryOptions({
    queryKey: ["service", slug],
    queryFn: async () => {
      const service = await getServiceBySlug({ data: { slug } });
      if (!service) throw notFound();
      return service;
    },
  });

export const Route = createFileRoute("/services/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(serviceQuery(params.slug)),
  head: ({ loaderData }) => {
    const service = loaderData;
    if (!service) return { meta: [{ title: "Service not found" }] };
    const title = service.meta_title?.trim() || `${service.title} in Dubai & UAE | Matla Al Anwar`;
    const description = service.meta_description?.trim() || service.description;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonicalUrl(`/services/${service.slug}`) },
      ],
      links: [{ rel: "canonical", href: canonicalUrl(`/services/${service.slug}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.title,
            description: service.description,
            url: canonicalUrl(`/services/${service.slug}`),
            serviceType: service.title,
            ...(service.image_url ? { image: service.image_url } : {}),
            provider: {
              "@type": "HomeAndConstructionBusiness",
              "@id": `${SITE_URL}/#business`,
              name: SITE.name,
              telephone: SITE.phoneHref.replace("tel:", ""),
              url: `${SITE_URL}/`,
              areaServed: [
                "Dubai", "Abu Dhabi", "Sharjah", "Ajman",
                "Ras Al Khaimah", "Fujairah", "Umm Al Quwain",
              ],
            },
            areaServed: {
              "@type": "Country",
              name: "United Arab Emirates",
            },
          }),
        },
      ],
    };
  },
  component: ServiceDetail,
  errorComponent: ({ error }) => <div className="container-page py-16 text-center text-muted-foreground">{error instanceof Error ? error.message : String(error)}</div>,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-navy">Service not found</h1>
      <Link to="/services" className="mt-4 inline-block text-primary hover:underline">← Back to services</Link>
    </div>
  ),
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data: service } = useSuspenseQuery(serviceQuery(slug));
  const name = (service.h1_override?.trim() || service.title).split(" | ")[0].replace(/ in Dubai and Across the UAE$/i, "");
  return (
    <DetailLayout
      backTo="/services"
      backLabel="All services"
      badgeIcon={PaintRoller}
      badge={BRAND.serviceBadge}
      title={service.h1_override?.trim() || service.title}
      description={service.description}
      imageUrl={service.image_url}
      imageAlt={service.image_alt}
      contentHtml={service.content_html}
      quoteTitle={`Need ${name.toLowerCase()}?`}
      currentPath={`/services/${service.slug}`}
    />
  );
}
