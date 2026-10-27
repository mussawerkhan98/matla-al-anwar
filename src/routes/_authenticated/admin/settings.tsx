import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminListSettings, adminUpdateSettings } from "@/lib/settings.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

type Field = {
  key: string;
  label: string;
  multiline?: boolean;
  group?: string;
  type?: "select";
  options?: { value: string; label: string }[];
};

const FIELDS: Field[] = [
  { key: "site_tagline", label: "Tagline" },
  { key: "site_phone", label: "Phone" },
  { key: "site_whatsapp", label: "WhatsApp number (digits only, e.g. 971501234567)" },
  { key: "site_email", label: "Email" },
  { key: "site_address", label: "Address" },
  { key: "meta_home_title", label: "Homepage SEO title" },
  { key: "meta_home_description", label: "Homepage SEO description", multiline: true },

  { key: "social_facebook", label: "Facebook page URL", group: "Social links" },
  { key: "social_instagram", label: "Instagram profile URL", group: "Social links" },
  { key: "social_linkedin", label: "LinkedIn page URL", group: "Social links" },
  { key: "social_tiktok", label: "TikTok profile URL", group: "Social links" },

  { key: "hero_badge_text", label: "Small badge text (above the headline)", group: "Homepage hero section" },
  { key: "hero_title", label: "Headline", multiline: true, group: "Homepage hero section" },
  { key: "hero_subtitle", label: "Subtitle paragraph", multiline: true, group: "Homepage hero section" },
  {
    key: "hero_text_theme",
    label: "Text color (choose based on your hero photo)",
    group: "Homepage hero section",
    type: "select",
    options: [
      { value: "light", label: "Light text — for dark/busy photos (default)" },
      { value: "dark", label: "Dark text — for bright/light photos" },
    ],
  },

  { key: "about_hero_title", label: "About page: headline", multiline: true, group: "About page" },
  { key: "about_hero_subtitle", label: "About page: intro paragraph", multiline: true, group: "About page" },
  { key: "about_story_p1", label: "About page: our story — paragraph 1", multiline: true, group: "About page" },
  { key: "about_story_p2", label: "About page: our story — paragraph 2", multiline: true, group: "About page" },
  { key: "about_story_p3", label: "About page: our story — paragraph 3", multiline: true, group: "About page" },
  { key: "stat_1_value", label: "About page: stat 1 value (e.g. 10+)", group: "About page" },
  { key: "stat_1_label", label: "About page: stat 1 label", group: "About page" },
  { key: "stat_2_value", label: "About page: stat 2 value", group: "About page" },
  { key: "stat_2_label", label: "About page: stat 2 label", group: "About page" },
  { key: "stat_3_value", label: "About page: stat 3 value", group: "About page" },
  { key: "stat_3_label", label: "About page: stat 3 label", group: "About page" },
  { key: "stat_4_value", label: "About page: stat 4 value", group: "About page" },
  { key: "stat_4_label", label: "About page: stat 4 label", group: "About page" },

  {
    key: "default_og_image",
    label: "Default social share image (og:image) — full URL, 1200x630 recommended",
    group: "SEO & business defaults",
  },
  {
    key: "business_address",
    label: "Business address (used in LocalBusiness structured data)",
    group: "SEO & business defaults",
  },
  { key: "business_hours_open", label: "Opening time (24h, e.g. 08:00)", group: "SEO & business defaults" },
  { key: "business_hours_close", label: "Closing time (24h, e.g. 22:00)", group: "SEO & business defaults" },

  { key: "home_core_eyebrow", label: "Small label above the heading", group: "Homepage: Painting & Sofa Cleaning cards" },
  { key: "home_core_title", label: "Heading", multiline: true, group: "Homepage: Painting & Sofa Cleaning cards" },
  { key: "home_core_desc", label: "Paragraph", multiline: true, group: "Homepage: Painting & Sofa Cleaning cards" },
  { key: "home_painting_title", label: "Painting card: title", group: "Homepage: Painting & Sofa Cleaning cards" },
  { key: "home_painting_desc", label: "Painting card: description", multiline: true, group: "Homepage: Painting & Sofa Cleaning cards" },
  { key: "home_sofa_title", label: "Sofa cleaning card: title", group: "Homepage: Painting & Sofa Cleaning cards" },
  { key: "home_sofa_desc", label: "Sofa cleaning card: description", multiline: true, group: "Homepage: Painting & Sofa Cleaning cards" },

  { key: "home_services_eyebrow", label: "Small label above the heading", group: "Homepage: Services section" },
  { key: "home_services_title", label: "Heading", multiline: true, group: "Homepage: Services section" },
  { key: "home_services_desc", label: "Paragraph", multiline: true, group: "Homepage: Services section" },

  { key: "home_fleet_eyebrow", label: "Small label above the heading", group: "Homepage: Prices section" },
  { key: "home_fleet_title", label: "Heading", multiline: true, group: "Homepage: Prices section" },
  { key: "home_fleet_desc", label: "Paragraph", multiline: true, group: "Homepage: Prices section" },

  { key: "home_why_eyebrow", label: "Small label above the heading", group: "Homepage: Why Matla Al Anwar section" },
  { key: "home_why_title", label: "Heading", multiline: true, group: "Homepage: Why Matla Al Anwar section" },

  { key: "home_coverage_eyebrow", label: "Small label above the heading", group: "Homepage: Areas section" },
  { key: "home_coverage_title", label: "Heading", multiline: true, group: "Homepage: Areas section" },
  { key: "home_coverage_desc", label: "Paragraph", multiline: true, group: "Homepage: Areas section" },

  {
    key: "home_testimonials_eyebrow",
    label: "Small label above the heading",
    group: "Homepage: Testimonials section",
  },
  { key: "home_testimonials_title", label: "Heading", multiline: true, group: "Homepage: Testimonials section" },

  { key: "home_cta_title", label: "Heading", multiline: true, group: "Homepage: bottom call-to-action banner" },
  { key: "home_cta_desc", label: "Paragraph", multiline: true, group: "Homepage: bottom call-to-action banner" },

  { key: "services_hero_eyebrow", label: "Small label above the heading", group: "Services page" },
  { key: "services_hero_title", label: "Heading", multiline: true, group: "Services page" },
  { key: "services_hero_subtitle", label: "Paragraph", multiline: true, group: "Services page" },

  { key: "fleet_hero_eyebrow", label: "Small label above the heading", group: "Pricing page" },
  { key: "fleet_hero_title", label: "Heading", multiline: true, group: "Pricing page" },
  { key: "fleet_hero_subtitle", label: "Paragraph", multiline: true, group: "Pricing page" },

  { key: "industries_hero_eyebrow", label: "Small label above the heading", group: "Who We Serve page" },
  { key: "industries_hero_title", label: "Heading", multiline: true, group: "Who We Serve page" },
  { key: "industries_hero_subtitle", label: "Paragraph", multiline: true, group: "Who We Serve page" },

  { key: "locations_hero_eyebrow", label: "Small label above the heading", group: "Areas page" },
  { key: "locations_hero_title", label: "Heading", multiline: true, group: "Areas page" },
  { key: "locations_hero_subtitle", label: "Paragraph", multiline: true, group: "Areas page" },

  { key: "contact_hero_eyebrow", label: "Small label above the heading", group: "Contact page" },
  { key: "contact_hero_title", label: "Heading", multiline: true, group: "Contact page" },
  { key: "contact_hero_subtitle", label: "Paragraph", multiline: true, group: "Contact page" },

  { key: "faq_hero_eyebrow", label: "Small label above the heading", group: "FAQ page" },
  { key: "faq_hero_title", label: "Heading", multiline: true, group: "FAQ page" },
  { key: "faq_hero_subtitle", label: "Paragraph", multiline: true, group: "FAQ page" },

  { key: "blog_hero_eyebrow", label: "Small label above the heading", group: "Blog page" },
  { key: "blog_hero_title", label: "Heading", multiline: true, group: "Blog page" },
  { key: "blog_hero_subtitle", label: "Paragraph", multiline: true, group: "Blog page" },
];

const GROUPS = [
  "Social links",
  "Homepage hero section",
  "Homepage: Painting & Sofa Cleaning cards",
  "Homepage: Services section",
  "Homepage: Prices section",
  "Homepage: Why Matla Al Anwar section",
  "Homepage: Areas section",
  "Homepage: Testimonials section",
  "Homepage: bottom call-to-action banner",
  "About page",
  "Services page",
  "Pricing page",
  "Who We Serve page",
  "Areas page",
  "Contact page",
  "FAQ page",
  "Blog page",
  "SEO & business defaults",
];

function SettingsPage() {
  const listFn = useServerFn(adminListSettings);
  const updateFn = useServerFn(adminUpdateSettings);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => listFn(),
  });

  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      const map: Record<string, string> = {};
      for (const row of data) map[row.key] = row.value ?? "";
      setForm(map);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => updateFn({ data: form }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Settings saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  if (isLoading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  function renderField(f: Field) {
    return (
      <div key={f.key} className="space-y-2">
        <Label htmlFor={f.key}>{f.label}</Label>
        {f.type === "select" ? (
          <select
            id={f.key}
            value={form[f.key] || f.options?.[0]?.value || ""}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : f.multiline ? (
          <Textarea
            id={f.key}
            rows={3}
            value={form[f.key] ?? ""}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
          />
        ) : (
          <Input
            id={f.key}
            value={form[f.key] ?? ""}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy">Site settings</h1>
        <p className="text-muted-foreground mt-1">
          Contact info and homepage meta text used across the site.
        </p>
      </header>

      <div className="space-y-5">
        {FIELDS.filter((f) => !f.group).map(renderField)}
      </div>

      {GROUPS.map((group) => (
        <div key={group} className="space-y-5 pt-6 border-t">
          <h2 className="font-display text-xl font-bold text-navy">{group}</h2>
          {FIELDS.filter((f) => f.group === group).map(renderField)}
        </div>
      ))}

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          Save settings
        </Button>
      </div>
    </div>
  );
}
