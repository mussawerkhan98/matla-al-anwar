import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { SITE, canonicalUrl } from "@/lib/site";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { settingsQuery, getSetting } from "@/lib/settings.query";
import { listFaqsPublic } from "@/lib/faqs.functions";
import { FaqSection } from "@/components/FaqSection";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { trackEvent } from "@/lib/analytics";

const contactFaqsQuery = () =>
  queryOptions({
    queryKey: ["faqs", "list", "contact"],
    queryFn: () => listFaqsPublic({ data: { page: "contact" } }),
  });

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  service: z.string().min(1, "Select a service"),
  phone: z.string().trim().min(6, "Enter a valid phone number").max(30),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
  area: z.string().trim().min(2, "Please enter your area").max(200),
  property: z.string().min(1, "Select a property type"),
  size: z.string().trim().max(120).optional().or(z.literal("")),
  date: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Matla Al Anwar | Free Painting & Sofa Cleaning Quote — UAE" },
      {
        name: "description",
        content:
          "Get a free quote for painting or sofa cleaning in Dubai, Sharjah, Abu Dhabi and across the UAE. Call or WhatsApp Matla Al Anwar — free inspection and fixed prices.",
      },
      { property: "og:title", content: "Contact Matla Al Anwar — Painting & Sofa Cleaning" },
      {
        property: "og:description",
        content: "Free quotes for painting and sofa cleaning across all seven emirates.",
      },
      { property: "og:url", content: canonicalUrl("/contact") },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/contact") }],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(contactFaqsQuery()),
      context.queryClient.ensureQueryData(settingsQuery()),
    ]),
  component: ContactPage,
});

function ContactPage() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: settings } = useSuspenseQuery(settingsQuery());
  const { data: faqs = [] } = useSuspenseQuery(contactFaqsQuery());
  const phone = getSetting(settings, "site_phone", SITE.phone);
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const whatsapp = getSetting(settings, "site_whatsapp", SITE.whatsapp);
  const whatsappHref = `https://wa.me/${whatsapp}?text=Hello%20Matla%20Al%20Anwar%2C%20I%20need%20a%20quote.`;
  const email = getSetting(settings, "site_email", SITE.email);
  const address = getSetting(settings, "site_address", SITE.address);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries());
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      const errMap: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errMap[issue.path.join(".")] = issue.message;
      }
      setErrors(errMap);
      setStatus("error");
      return;
    }
    const d = parsed.data;
    const msg = [
      `Hello Matla Al Anwar, I'd like a quote.`,
      ``,
      `Name: ${d.name}`,
      `Phone: ${d.phone}`,
      d.email ? `Email: ${d.email}` : null,
      `Service: ${d.service}`,
      `Area: ${d.area}`,
      `Property: ${d.property}`,
      d.size ? `Size / quantity: ${d.size}` : null,
      d.date ? `Preferred date: ${d.date}` : null,
      d.message ? `Notes: ${d.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener");
    trackEvent("generate_lead", {
      form_name: "quote_form",
      method: "whatsapp",
      service: d.service,
      property: d.property,
    });
    setStatus("success");
    form.reset();
  }

  const inputCls =
    "mt-1 block w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition";

  return (
    <>
    <section className="container-page py-16">
      <div className="grid gap-12 lg:grid-cols-5">
        <aside className="lg:col-span-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
            {getSetting(settings, "contact_hero_eyebrow", "Contact")}
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold text-navy tracking-tight">
            {getSetting(settings, "contact_hero_title", "Get a free painting or sofa cleaning quote.")}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {getSetting(
              settings,
              "contact_hero_subtitle",
              "Send the form and we'll open WhatsApp with your details filled in. Add a few photos in the chat for the fastest, most accurate price.",
            )}
          </p>

          <div className="mt-8 space-y-4">
            <a
              href={phoneHref}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-primary hover:bg-accent transition-colors"
            >
              <div className="h-11 w-11 rounded-xl gradient-brand text-white flex items-center justify-center">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Call us
                </div>
                <div className="font-semibold text-navy">{phone}</div>
              </div>
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-primary hover:bg-accent transition-colors"
            >
              <div className="h-11 w-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center">
                <WhatsAppIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  WhatsApp
                </div>
                <div className="font-semibold text-navy">Send photos for a quote</div>
              </div>
            </a>
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-primary hover:bg-accent transition-colors"
            >
              <div className="h-11 w-11 rounded-xl bg-navy text-white flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
                <div className="font-semibold text-navy truncate">{email}</div>
              </div>
            </a>
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="h-11 w-11 rounded-xl bg-accent text-primary flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Based in
                </div>
                <div className="font-semibold text-navy">{address}</div>
              </div>
            </div>
          </div>
        </aside>

        <form
          onSubmit={onSubmit}
          noValidate
          className="lg:col-span-3 rounded-3xl border border-border bg-card shadow-card p-6 sm:p-8"
        >
          {status === "success" && (
            <div className="mb-6 rounded-xl bg-green-50 border border-green-200 text-green-800 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="text-sm">
                Your quote request opened in WhatsApp. If it didn't, message us directly at {phone}.
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name*" name="name" error={errors.name}>
              <input name="name" required className={inputCls} placeholder="Your name" />
            </Field>
            <Field label="Service*" name="service" error={errors.service}>
              <select name="service" required defaultValue="" className={inputCls}>
                <option value="" disabled>
                  Select a service
                </option>
                <option>Interior painting</option>
                <option>Exterior / villa painting</option>
                <option>Move-in / move-out painting</option>
                <option>Sofa cleaning</option>
                <option>Majlis / carpet cleaning</option>
                <option>Mattress / upholstery cleaning</option>
                <option>Painting + sofa cleaning</option>
              </select>
            </Field>
            <Field label="Phone / WhatsApp*" name="phone" error={errors.phone}>
              <input
                name="phone"
                required
                inputMode="tel"
                className={inputCls}
                placeholder="+971 5x xxx xxxx"
              />
            </Field>
            <Field label="Email" name="email" error={errors.email}>
              <input name="email" type="email" className={inputCls} placeholder="you@example.com" />
            </Field>
            <Field label="Area / emirate*" name="area" error={errors.area}>
              <input name="area" required className={inputCls} placeholder="e.g. JVC, Dubai" />
            </Field>
            <Field label="Property type*" name="property" error={errors.property}>
              <select name="property" required defaultValue="" className={inputCls}>
                <option value="" disabled>
                  Select property
                </option>
                <option>Studio</option>
                <option>Apartment</option>
                <option>Villa / townhouse</option>
                <option>Office</option>
                <option>Shop / restaurant</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Size / quantity" name="size" error={errors.size}>
              <input name="size" className={inputCls} placeholder="e.g. 2 BHK, or 3-seater + 2 chairs" />
            </Field>
            <Field label="Preferred date" name="date" error={errors.date}>
              <input name="date" type="date" className={inputCls} />
            </Field>
            <Field
              label="Notes / special instructions"
              name="message"
              error={errors.message}
              className="sm:col-span-2"
            >
              <textarea
                name="message"
                rows={4}
                className={inputCls}
                placeholder="Colours, wall condition, stains, fabric type — anything that helps us price it."
              />
            </Field>
          </div>

          <button
            type="submit"
            className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full gradient-brand text-white px-8 py-3.5 text-sm font-semibold shadow-elegant hover-lift"
          >
            <Send className="h-4 w-4" /> Send Quote Request
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            By submitting, you agree to be contacted about your request. We never share your
            details.
          </p>
        </form>
      </div>
    </section>

      <FaqSection faqs={faqs} eyebrow="FAQ" title="Before you reach out." seeAllHref="/faq" />
    </>
  );
}

function Field({
  label,
  name,
  error,
  children,
  className = "",
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label htmlFor={name} className={`block ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-navy">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
