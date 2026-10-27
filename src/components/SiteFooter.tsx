import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Paintbrush, Facebook, Instagram, Linkedin } from "lucide-react";
import { SITE, NAV_LINKS, SERVICES } from "@/lib/site";
import { useSuspenseQuery } from "@tanstack/react-query";
import { settingsQuery, getSetting } from "@/lib/settings.query";
import { locationsQuery } from "@/lib/locations.query";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 5.82c-.86-.83-1.35-1.98-1.35-3.32h-3.05v13.36c0 1.53-1.24 2.77-2.77 2.77a2.77 2.77 0 0 1 0-5.54c.28 0 .55.04.8.12V9.98a5.86 5.86 0 0 0-.8-.06 5.82 5.82 0 1 0 5.82 5.82V8.9a7.06 7.06 0 0 0 4.15 1.33V7.19c-.93 0-1.79-.29-2.5-.78-.1-.06-.2-.13-.3-.2Z" />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { data: settings } = useSuspenseQuery(settingsQuery());
  const { data: locations } = useSuspenseQuery(locationsQuery());
  const phone = getSetting(settings, "site_phone", SITE.phone);
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const whatsapp = getSetting(settings, "site_whatsapp", SITE.whatsapp);
  const whatsappHref = `https://wa.me/${whatsapp}?text=Hello%20Matla%20Al%20Anwar%2C%20I%20need%20a%20quote.`;
  const email = getSetting(settings, "site_email", SITE.email);
  const address = getSetting(settings, "site_address", SITE.address);
  const tagline = getSetting(settings, "site_tagline", SITE.tagline);
  const facebook = getSetting(settings, "social_facebook", "");
  const instagram = getSetting(settings, "social_instagram", "");
  const linkedin = getSetting(settings, "social_linkedin", "");
  const tiktok = getSetting(settings, "social_tiktok", "");
  const socialLinks = [
    { url: facebook, label: "Facebook", Icon: Facebook },
    { url: instagram, label: "Instagram", Icon: Instagram },
    { url: linkedin, label: "LinkedIn", Icon: Linkedin },
    { url: tiktok, label: "TikTok", Icon: TikTokIcon },
  ].filter((s) => s.url.trim().length > 0);
  return (
    <footer className="mt-24 bg-navy text-ice">
      <div className="container-page py-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 max-w-md">
          <div className="flex items-center gap-3 mb-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1.5">
              <img src="/logo.png" alt="" width={48} height={48} className="h-full w-full object-contain" />
            </span>
            <div>
              <div className="font-display font-bold text-lg">Matla Al Anwar</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-ice/60">
                Painting &amp; Sofa Cleaning
              </div>
            </div>
          </div>
          <p className="text-ice/70 text-sm leading-relaxed">
            Professional interior and exterior painting, villa and apartment repainting, and deep
            sofa, upholstery, majlis and mattress cleaning for homes and businesses across all seven
            emirates — with fixed prices and a team that treats your home with care.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-4 py-2 text-xs font-medium">
            <Paintbrush className="h-4 w-4" aria-hidden /> {tagline}
          </div>
          {socialLinks.length > 0 && (
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map(({ url, label, Icon }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-ice/80 hover:bg-secondary hover:text-navy transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ice mb-4">Services</h2>
          <ul className="space-y-2.5 text-sm">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="text-ice/70 hover:text-secondary transition-colors"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ice mb-4">Explore</h2>
          <ul className="space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-ice/70 hover:text-secondary transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ice mb-4">
            Areas We Serve
          </h2>
          <ul className="space-y-2.5 text-sm">
            {locations.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/locations/$city"
                  params={{ city: c.slug }}
                  className="text-ice/70 hover:text-secondary transition-colors"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <a href={phoneHref} className="flex items-center gap-2 text-ice/80 hover:text-secondary">
            <Phone className="h-4 w-4 text-secondary" /> {phone}
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-ice/80 hover:text-secondary"
          >
            <WhatsAppIcon className="h-4 w-4 text-secondary" /> WhatsApp
          </a>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-ice/80 hover:text-secondary break-all"
          >
            <Mail className="h-4 w-4 text-secondary shrink-0" /> {email}
          </a>
          <div className="flex items-center gap-2 text-ice/80">
            <MapPin className="h-4 w-4 text-secondary" /> {address}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ice/60">
          <p>
            © {year} {SITE.name} LLC. All rights reserved.
          </p>
          <p>{SITE.hours}</p>
          <p>
            Powered by{" "}
            <a
              href="https://www.byteflow.ae"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-secondary hover:text-white transition-colors"
            >
              Byteflow
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
