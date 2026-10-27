import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { attachClickTracking, isTrackedPath, loadAnalytics, trackPageView } from "@/lib/analytics";

/** Loads GA4 on public pages, sends a page_view per route change and tracks call/WhatsApp clicks. */
export function Analytics() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isTrackedPath(pathname)) return;
    loadAnalytics();
    // Wait a tick so the new page's <title> is in place.
    const t = window.setTimeout(() => trackPageView(pathname), 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => attachClickTracking(), []);

  return null;
}
