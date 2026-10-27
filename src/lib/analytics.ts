/**
 * Google Analytics 4 (gtag.js) helpers.
 *
 * Tracked events (mark these as Key events in GA4 → Admin → Events):
 *  - click_call       any tel: link (header, floating button, footer, pages)
 *  - click_whatsapp   any wa.me / api.whatsapp.com link
 *  - generate_lead    contact / quote form submitted successfully
 *
 * Admin and auth pages are never tracked.
 */

export const GA_MEASUREMENT_ID = "G-5JBNC0PN1V";

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

let loaded = false;

export function isTrackedPath(pathname: string): boolean {
  return !pathname.startsWith("/admin") && !pathname.startsWith("/auth");
}

/** Inject gtag.js once, on the client only. */
export function loadAnalytics(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag expects the raw `arguments` object, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  // Page views are sent manually on route change (single-page app).
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s);
}

export function trackPageView(pathname: string): void {
  if (!window.gtag || !isTrackedPath(pathname)) return;
  window.gtag("event", "page_view", {
    page_path: pathname,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined" || !window.gtag) return;
  if (!isTrackedPath(window.location.pathname)) return;
  window.gtag("event", name, { page_path: window.location.pathname, ...params });
}

/** Describe where on the page a link sits, e.g. "header", "footer", "floating". */
function linkLocation(el: Element): string {
  if (el.closest("header")) return "header";
  if (el.closest("footer")) return "footer";
  if (el.closest(".fixed")) return "floating_button";
  return "page_body";
}

/**
 * One delegated listener catches every call / WhatsApp link on the site,
 * including ones added later in admin content, without editing each button.
 */
export function attachClickTracking(): () => void {
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.("a[href]");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    const label = (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 100);
    const common = { link_url: href, link_text: label, link_location: linkLocation(a) };

    if (href.startsWith("tel:")) {
      trackEvent("click_call", common);
    } else if (/(^https?:\/\/)?(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(href)) {
      trackEvent("click_whatsapp", { ...common, link_url: href.split("?")[0] });
    }
  };
  document.addEventListener("click", onClick, { capture: true });
  return () => document.removeEventListener("click", onClick, { capture: true });
}
