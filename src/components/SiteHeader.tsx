import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site";
import { useSuspenseQuery } from "@tanstack/react-query";
import { settingsQuery, getSetting } from "@/lib/settings.query";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: settings } = useSuspenseQuery(settingsQuery());
  const phone = getSetting(settings, "site_phone", SITE.phone);
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-background/85 border-b border-border shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container-page flex h-24 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label={SITE.name}>
          <img
            src="/logo.png"
            alt="Matla Al Anwar Chiller Van Transport logo"
            width={72}
            height={72}
            className="h-[68px] w-[68px] object-contain shrink-0"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 text-sm font-medium text-foreground/80 rounded-md hover:text-primary hover:bg-accent transition-colors"
              activeProps={{ className: "text-primary bg-accent" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={phoneHref}
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {phone}
          </a>
          <Link
            to="/contact"
            className="hidden md:inline-flex items-center rounded-full gradient-brand text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-elegant hover-lift"
          >
            Get Quote
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-md text-foreground hover:bg-accent"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container-page py-4 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-primary"
                activeProps={{ className: "text-primary bg-accent" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center rounded-full gradient-brand text-primary-foreground px-5 py-3 text-sm font-semibold"
            >
              Get Instant Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
