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
  company: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().min(6, "Enter a valid phone number").max(30),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
  pickup: z.string().trim().min(2, "Pickup location required").max(200),
  dropoff: z.string().trim().min(2, "Drop-off location required").max(200),
  vehicle: z.string().min(1, "Select a vehicle"),
  temperature: z.string().min(1, "Select a temperature range"),
  duration: z.string().min(1, "Select duration"),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Matla Al Anwar Chiller Van Transport | Get a Quote — UAE" },
      {
        name: "description",
        content:
          "Contact Matla Al Anwar for chiller van and freezer truck rental across the UAE. WhatsApp +971 50 000 0000, 24/7 dispatch and instant quotes.",
      },
      { property: "og:title", content: "Contact Matla Al Anwar Chiller Van Transport" },
      {
        property: "og:description",
        content: "Get an instant quote for refrigerated transport across all seven emirates.",
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
  const whatsappHref = `https://wa.me/${whatsapp}?text=Hello%20Matla%20Al%20Anwar%2C%20I%20need%20a%20chiller%20van%20quote.`;
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
      `Hello Matla Al Anwar, I'd like a chiller van quote.`,
      ``,
      `Name: ${d.name}`,
      d.company ? `Company: ${d.company}` : null,
      `Phone: ${d.phone}`,
      d.email ? `Email: ${d.email}` : null,
      `Pickup: ${d.pickup}`,
      `Drop-off: ${d.dropoff}`,
      `Vehicle: ${d.vehicle}`,
      `Temperature: ${d.temperature}`,
      `Duration: ${d.duration}`,
      d.message ? `Notes: ${d.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener");
    trackEvent("generate_lead", {
      form_name: "quote_form",
      method: "whatsapp",
      vehicle: d.vehicle,
      temperature: d.temperature,
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
            {getSetting(settings, "contact_hero_title", "Get an instant chiller van quote.")}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {getSetting(
              settings,
              "contact_hero_subtitle",
              "Send the form and we'll open WhatsApp with your details filled in — reply usually within minutes, 24/7.",
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
                  Call 24/7
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
                <div className="font-semibold text-navy">Chat with dispatch</div>
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
            <Field label="Company" name="company" error={errors.company}>
              <input name="company" className={inputCls} placeholder="Optional" />
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
              <input name="email" type="email" className={inputCls} placeholder="you@company.ae" />
            </Field>
            <Field label="Pickup location*" name="pickup" error={errors.pickup}>
              <input
                name="pickup"
                required
                className={inputCls}
                placeholder="e.g. Al Quoz, Dubai"
              />
            </Field>
            <Field label="Drop-off location*" name="dropoff" error={errors.dropoff}>
              <input
                name="dropoff"
                required
                className={inputCls}
                placeholder="e.g. Yas Island, Abu Dhabi"
              />
            </Field>
            <Field label="Vehicle*" name="vehicle" error={errors.vehicle}>
              <select name="vehicle" required defaultValue="" className={inputCls}>
                <option value="" disabled>
                  Select a vehicle
                </option>
                <option>Toyota Hiace Chiller Van</option>
                <option>Nissan Urvan Chiller Van</option>
                <option>1 Ton Pickup Chiller</option>
                <option>3 Ton Chiller Truck</option>
                <option>5 Ton Chiller Truck</option>
                <option>Freezer Truck (Deep Freeze)</option>
              </select>
            </Field>
            <Field label="Temperature*" name="temperature" error={errors.temperature}>
              <select name="temperature" required defaultValue="" className={inputCls}>
                <option value="" disabled>
                  Select range
                </option>
                <option>+2°C to +8°C (Chill)</option>
                <option>0°C to +2°C (Fresh)</option>
                <option>−18°C to −25°C (Freeze)</option>
                <option>Ambient / Not sure</option>
              </select>
            </Field>
            <Field
              label="Rental duration*"
              name="duration"
              error={errors.duration}
              className="sm:col-span-2"
            >
              <select name="duration" required defaultValue="" className={inputCls}>
                <option value="" disabled>
                  Select duration
                </option>
                <option>One-time trip</option>
                <option>Hourly</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Long-term contract</option>
              </select>
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
                placeholder="Cargo type, dates, dimensions, anything else."
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
