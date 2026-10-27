import type { ErrorComponentProps } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingCTAs } from "@/components/FloatingCTAs";
import { Analytics } from "@/components/Analytics";
import { SITE, SITE_URL } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery, getSetting } from "@/lib/settings.query";
import { locationsQuery } from "@/lib/locations.query";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold tracking-widest uppercase text-primary">404</p>
        <h1 className="mt-3 text-4xl font-bold text-foreground">This page has been painted over</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist. Let's get you back on track.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant hover-lift"
          >
            Go home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function buildOrgJsonLd(settings: Record<string, string | null> | undefined) {
  // sameAs: pulled from admin-editable Site settings (Social links group) when
  // present; falls back to an empty list (no hardcoded social URLs) if none
  // have been configured yet.
  const sameAs = [
    getSetting(settings, "social_facebook", ""),
    getSetting(settings, "social_instagram", ""),
    getSetting(settings, "social_linkedin", ""),
    getSetting(settings, "social_tiktok", ""),
  ].filter((url) => url && url.trim().length > 0);

  return {
    "@context": "https://schema.org",
    "@type": ["HomeAndConstructionBusiness", "LocalBusiness"],
    "@id": `${SITE_URL}/#business`,
    name: SITE.name,
    url: `${SITE_URL}/`,
    image: getSetting(settings, "default_og_image", `${SITE_URL}/og-image.jpg`),
    description: SITE.description,
    telephone: getSetting(settings, "site_phone", SITE.phone),
    email: getSetting(settings, "site_email", SITE.email),
    address: {
      "@type": "PostalAddress",
      streetAddress: getSetting(settings, "business_address", SITE.address),
      addressCountry: "AE",
    },
    areaServed: [
      "Dubai", "Abu Dhabi", "Sharjah", "Ajman",
      "Ras Al Khaimah", "Fujairah", "Umm Al Quwain",
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: getSetting(settings, "business_hours_open", "08:00"),
      closes: getSetting(settings, "business_hours_close", "22:00"),
    },
    logo: `${SITE_URL}/logo.png`,
    priceRange: "AED 99 – AED 5,000",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Painting & sofa cleaning",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Interior painting" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Exterior & villa painting" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sofa cleaning" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Upholstery & mattress cleaning" } },
      ],
    },
    sameAs,
  };
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(settingsQuery()),
      context.queryClient.ensureQueryData(locationsQuery()),
    ]),
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#1A3FA9" },
      { title: "Painting & Sofa Cleaning Services in Dubai & UAE | Matla Al Anwar" },
      { name: "description", content: SITE.description },
      { name: "author", content: SITE.name },
      { name: "keywords", content: "painting services Dubai, painters in Dubai, villa painting Dubai, apartment painting Sharjah, house painting UAE, sofa cleaning Dubai, sofa shampoo, upholstery cleaning Dubai, majlis cleaning, mattress cleaning Abu Dhabi" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_AE" },
      { property: "og:title", content: "Painting & Sofa Cleaning Services in Dubai & UAE | Matla Al Anwar" },
      { property: "og:description", content: SITE.description },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Painting & Sofa Cleaning Services in Dubai & UAE | Matla Al Anwar" },
      { name: "twitter:description", content: SITE.description },
      { name: "geo.region", content: "AE-DU" },
      { property: "og:image", content: getSetting(loaderData?.[0], "default_og_image", `${SITE_URL}/og-image.jpg`) },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Matla Al Anwar — painting and sofa cleaning services across the UAE" },
      { name: "twitter:image", content: getSetting(loaderData?.[0], "default_og_image", `${SITE_URL}/og-image.jpg`) },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=optional",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(buildOrgJsonLd(loaderData?.[0])),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isChromeless = pathname.startsWith("/admin") || pathname.startsWith("/auth");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <Analytics />
      {isChromeless ? (
        <Outlet />
      ) : (
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
          <FloatingCTAs />
        </div>
      )}
    </QueryClientProvider>
  );
}
