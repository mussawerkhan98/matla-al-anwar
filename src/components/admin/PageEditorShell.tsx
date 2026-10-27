import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Circle, ExternalLink, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseContent } from "@/lib/content-sections";
import { BRAND } from "@/lib/page-brand";

export type CheckItem = { label: string; ok: boolean; hint?: string };

/** Numbered card that groups related fields. */
export function FormSection({
  n,
  title,
  description,
  children,
}: {
  n: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-brand text-sm font-bold text-white">{n}</span>
        <div>
          <h2 className="font-display text-lg font-bold text-navy">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/** "12 / 60" counter that turns amber when outside the ideal range. */
export function CharCount({ value, min = 0, max }: { value: string; min?: number; max: number }) {
  const n = value.trim().length;
  const ok = n === 0 || (n >= min && n <= max);
  return (
    <span className={`text-xs tabular-nums ${ok ? "text-muted-foreground" : "font-semibold text-amber-600"}`}>
      {n} / {max}
    </span>
  );
}

/** How the page might look in Google results. */
export function GooglePreview({ title, path, description }: { title: string; path: string; description: string }) {
  const t = title.trim() || "Page title";
  const d = description.trim() || "Add a short description so Google can show a summary of this page.";
  return (
    <div className="rounded-xl border border-border bg-white p-4 font-sans">
      <div className="text-xs text-muted-foreground">Google preview</div>
      <div className="mt-2 text-xs text-[#202124]">{BRAND.domain}{path}</div>
      <div className="mt-0.5 line-clamp-1 text-lg leading-snug text-[#1a0dab]">{t.length > 62 ? t.slice(0, 60) + "…" : t}</div>
      <div className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{d.length > 162 ? d.slice(0, 160) + "…" : d}</div>
    </div>
  );
}

/** Shared checklist rules for service/industry pages. */
export function contentChecks(contentHtml: string): CheckItem[] {
  const { intro, sections } = parseContent(contentHtml);
  const hasFaq = sections.some((s) => s.kind === "faq");
  return [
    { label: "Intro paragraph written", ok: intro.replace(/<[^>]+>/g, "").trim().length > 40 },
    { label: "At least 3 page sections", ok: sections.length >= 3, hint: `${sections.length} so far` },
    { label: "FAQ with answers", ok: hasFaq, hint: "Helps Google and customers" },
  ];
}

export function PageEditorShell({
  backTo,
  backLabel,
  heading,
  subheading,
  viewHref,
  checklist,
  saving,
  canSave,
  saveLabel,
  onSave,
  onCancel,
  children,
}: {
  backTo: "/admin/services" | "/admin/industries";
  backLabel: string;
  heading: string;
  subheading?: string;
  viewHref?: string;
  checklist: CheckItem[];
  saving: boolean;
  canSave: boolean;
  saveLabel: string;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  const done = checklist.filter((c) => c.ok).length;
  const pct = Math.round((done / Math.max(checklist.length, 1)) * 100);
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl space-y-6 p-4 pb-28 sm:p-6 lg:p-8 lg:pb-28">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </Link>
          {viewHref && (
            <a href={viewHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              View live page <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">{heading}</h1>
          {subheading && <p className="mt-1 text-muted-foreground">{subheading}</p>}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
          <div className="min-w-0 space-y-6">{children}</div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-navy">Page checklist</span>
                <span className="text-sm font-semibold text-primary">{pct}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full gradient-brand transition-all" style={{ width: `${pct}%` }} />
              </div>
              <ul className="mt-4 space-y-2.5">
                {checklist.map((c) => (
                  <li key={c.label} className="flex items-start gap-2 text-sm">
                    {c.ok ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                    )}
                    <span>
                      <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                      {c.hint && !c.ok && <span className="block text-xs text-muted-foreground">{c.hint}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-navy p-5 text-sm text-white/80">
              <div className="font-display font-bold text-white">Quick tips</div>
              <ul className="mt-2 list-disc space-y-1.5 pl-4">
                <li>Use the ready-made layout for new pages, then fill in the text.</li>
                <li>Click <b className="text-white">Preview</b> to see the design before saving.</li>
                <li>Empty cards and unanswered questions are hidden automatically.</li>
                <li>Mention Dubai, the UAE and the vehicle type naturally for SEO.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed bottom-0 left-64 right-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <span className="hidden text-sm text-muted-foreground sm:block">
            {done} of {checklist.length} checklist items done
          </span>
          <div className="ml-auto flex gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving || !canSave}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
              {saveLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
