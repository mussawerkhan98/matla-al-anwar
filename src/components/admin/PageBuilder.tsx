import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Code2,
  Eye,
  HelpCircle,
  LayoutGrid,
  ListOrdered,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Table2,
  Type,
  Wand2,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DesignedContent } from "@/components/DesignedContent";
import { ContentFormatGuide } from "@/components/admin/ContentFormatGuide";
import { locationsQuery } from "@/lib/locations.query";
import {
  BLOCK_INFO,
  blocksToHtml,
  emptyBlock,
  htmlToBlocks,
  templateBlocks,
  type AreaLink,
  type Block,
  type BlockType,
  type CardItem,
} from "@/lib/page-blocks";
import { BRAND } from "@/lib/page-brand";

const RichTextEditor = lazy(() =>
  import("@/components/admin/RichTextEditor").then((m) => ({ default: m.RichTextEditor })),
);

const ICONS: Record<BlockType, LucideIcon> = {
  intro: Sparkles,
  cards: LayoutGrid,
  steps: ListOrdered,
  faq: HelpCircle,
  areas: MapPin,
  text: Type,
  html: Table2,
};

type Mode = "builder" | "preview" | "advanced";

function move<T>(arr: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const copy = arr.slice();
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

const MARKUP_TIP = `Tip: **bold text**, [link text](${BRAND.examples.linkExample}), start a line with - for a bullet, leave an empty line for a new paragraph.`;

function IconBtn({ onClick, title, children, danger, disabled }: { onClick: () => void; title: string; children: React.ReactNode; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-30 ${
        danger ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ItemsEditor({
  items,
  onChange,
  numbered,
  addLabel,
}: {
  items: CardItem[];
  onChange: (items: CardItem[]) => void;
  numbered?: boolean;
  addLabel: string;
}) {
  const set = (i: number, patch: Partial<CardItem>) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-2.5">
          <span
            className={`mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
              numbered ? "bg-navy text-white" : "bg-primary/10 text-primary"
            }`}
          >
            {i + 1}
          </span>
          <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <Input
              value={it.title}
              onChange={(e) => set(i, { title: e.target.value })}
              placeholder={numbered ? "Step title, e.g. Get a clear quote" : "Bold title, e.g. Daily hire"}
              className="bg-background font-medium"
            />
            <Input
              value={it.text}
              onChange={(e) => set(i, { text: e.target.value })}
              placeholder="Short description (optional)"
              className="bg-background"
            />
          </div>
          <div className="flex shrink-0">
            <IconBtn onClick={() => onChange(move(items, i, -1))} title="Move up" disabled={i === 0}>
              <ArrowUp className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn onClick={() => onChange(move(items, i, 1))} title="Move down" disabled={i === items.length - 1}>
              <ArrowDown className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn onClick={() => onChange(items.filter((_, k) => k !== i))} title="Remove" danger>
              <X className="h-3.5 w-3.5" />
            </IconBtn>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { title: "", text: "" }])}>
        <Plus className="mr-1 h-3.5 w-3.5" /> {addLabel}
      </Button>
    </div>
  );
}

function AreasEditor({ links, onChange }: { links: AreaLink[]; onChange: (l: AreaLink[]) => void }) {
  const { data: locations = [] } = useQuery(locationsQuery());
  const all: AreaLink[] = locations
    .filter((l: any) => l.slug)
    .map((l: any) => ({ href: `/locations/${l.slug}`, label: l.name as string }));
  // Keep any previously chosen links that are not in the list.
  const extra = links.filter((l) => !all.some((a) => a.href === l.href));
  const options = [...all, ...extra];
  const on = (href: string) => links.some((l) => l.href === href);
  const toggle = (opt: AreaLink) =>
    onChange(on(opt.href) ? links.filter((l) => l.href !== opt.href) : options.filter((o) => on(o.href) || o.href === opt.href));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.href}
            type="button"
            onClick={() => toggle(o)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors ${
              on(o.href) ? "bg-navy text-white ring-navy" : "bg-background text-muted-foreground ring-border hover:ring-primary"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" /> {o.label}
          </button>
        ))}
        {options.length === 0 && <span className="text-sm text-muted-foreground">Add locations in Admin → Locations first.</span>}
      </div>
      {options.length > 0 && (
        <div className="flex gap-3 text-xs">
          <button type="button" className="font-medium text-primary hover:underline" onClick={() => onChange(options)}>
            Select all
          </button>
          <button type="button" className="font-medium text-muted-foreground hover:underline" onClick={() => onChange([])}>
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

function summary(b: Block): string {
  switch (b.type) {
    case "intro":
      return b.text.trim() ? b.text.trim().slice(0, 90) + (b.text.length > 90 ? "…" : "") : "Empty — add an opening paragraph";
    case "cards":
      return `${b.items.filter((i) => i.title.trim() || i.text.trim()).length} cards`;
    case "steps":
      return `${b.items.filter((i) => i.title.trim() || i.text.trim()).length} steps`;
    case "faq":
      return `${b.items.filter((f) => f.q.trim() && f.a.trim()).length} answered questions`;
    case "areas":
      return `${b.links.length} areas selected`;
    case "text":
      return b.text.trim() ? b.text.trim().slice(0, 90) + (b.text.length > 90 ? "…" : "") : "Empty";
    case "html":
      return "Table / custom content";
  }
}

function BlockEditor({ block, onChange, onAdvanced }: { block: Block; onChange: (b: Block) => void; onAdvanced: () => void }) {
  switch (block.type) {
    case "html":
      return (
        <div className="space-y-3">
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
            This section has a table or other special content, so it is kept exactly as it is. You can move or delete it here;
            to change its content use the{" "}
            <button type="button" onClick={onAdvanced} className="font-semibold underline">
              Advanced editor
            </button>
            .
          </p>
          <div className="max-h-72 overflow-auto rounded-lg border border-border bg-background p-4 text-sm [&_table]:w-full [&_td]:border [&_td]:p-1.5 [&_th]:border [&_th]:p-1.5" dangerouslySetInnerHTML={{ __html: block.html }} />
        </div>
      );
    case "intro":
      return (
        <div className="space-y-4">
          <Field label="Tagline (small red label)" hint="Short, max ~60 characters. Leave empty to hide.">
            <Input value={block.tagline} maxLength={60} onChange={(e) => onChange({ ...block, tagline: e.target.value })} placeholder={BRAND.tagline} />
          </Field>
          <Field label="Opening paragraphs" hint={MARKUP_TIP}>
            <Textarea
              rows={5}
              value={block.text}
              onChange={(e) => onChange({ ...block, text: e.target.value })}
              placeholder={`${BRAND.name} provides … in Dubai and across the UAE. Explain who it is for and what makes it reliable.`}
            />
          </Field>
          <Field label="Intro heading (optional)" hint="Only shown if it is different from the page title.">
            <Input value={block.heading} onChange={(e) => onChange({ ...block, heading: e.target.value })} />
          </Field>
        </div>
      );
    case "cards":
    case "steps":
      return (
        <div className="space-y-4">
          <Field label="Text above the cards (optional)">
            <Textarea rows={2} value={block.lead} onChange={(e) => onChange({ ...block, lead: e.target.value })} />
          </Field>
          <Field label={block.type === "steps" ? "Steps" : "Cards"} hint="Empty rows are not shown on the website.">
            <ItemsEditor
              items={block.items}
              numbered={block.type === "steps"}
              addLabel={block.type === "steps" ? "Add step" : "Add card"}
              onChange={(items) => onChange({ ...block, items })}
            />
          </Field>
          <Field label="Text below the cards (optional)" hint={MARKUP_TIP}>
            <Textarea rows={2} value={block.after} onChange={(e) => onChange({ ...block, after: e.target.value })} />
          </Field>
        </div>
      );
    case "faq":
      return (
        <div className="space-y-2">
          {block.items.map((f, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-2.5">
              <span className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">Q</span>
              <div className="flex-1 space-y-2">
                <Input
                  value={f.q}
                  onChange={(e) => onChange({ ...block, items: block.items.map((x, k) => (k === i ? { ...x, q: e.target.value } : x)) })}
                  placeholder="Question, e.g. Do you operate 24/7?"
                  className="bg-background font-medium"
                />
                <Textarea
                  rows={2}
                  value={f.a}
                  onChange={(e) => onChange({ ...block, items: block.items.map((x, k) => (k === i ? { ...x, a: e.target.value } : x)) })}
                  placeholder="Answer"
                  className="bg-background"
                />
              </div>
              <div className="flex shrink-0 flex-col">
                <IconBtn onClick={() => onChange({ ...block, items: move(block.items, i, -1) })} title="Move up" disabled={i === 0}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </IconBtn>
                <IconBtn onClick={() => onChange({ ...block, items: move(block.items, i, 1) })} title="Move down" disabled={i === block.items.length - 1}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </IconBtn>
                <IconBtn onClick={() => onChange({ ...block, items: block.items.filter((_, k) => k !== i) })} title="Remove" danger>
                  <X className="h-3.5 w-3.5" />
                </IconBtn>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Questions without an answer are not shown on the website.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...block, items: [...block.items, { q: "", a: "" }] })}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add question
          </Button>
        </div>
      );
    case "areas":
      return <AreasEditor links={block.links} onChange={(links) => onChange({ ...block, links })} />;
    case "text":
      return (
        <Field label="Text" hint={MARKUP_TIP}>
          <Textarea rows={6} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />
        </Field>
      );
  }
}

/**
 * Visual page builder for service & industry pages. Stores plain HTML in content_html
 * (same format the public pages render), so nothing else has to change.
 */
export function PageBuilder({
  value,
  onChange,
  kind,
  name,
  pageTitle,
}: {
  value: string;
  onChange: (html: string) => void;
  kind: "service" | "industry";
  name: string;
  pageTitle: string;
}) {
  const [mode, setMode] = useState<Mode>("builder");
  const [blocks, setBlocks] = useState<Block[]>(() => (value?.trim() ? htmlToBlocks(value) : []));
  const [open, setOpen] = useState<Set<string>>(() => new Set(blocks[0] ? [blocks[0].id] : []));
  const [adding, setAdding] = useState(false);
  const last = useRef<string>(value);
  const { data: locations = [] } = useQuery(locationsQuery());

  // Re-read the content when it changes from outside (loaded from the database,
  // or edited in the advanced editor).
  useEffect(() => {
    if (mode !== "advanced" && value !== last.current) {
      last.current = value;
      const next = value?.trim() ? htmlToBlocks(value) : [];
      setBlocks(next);
      setOpen(new Set(next[0] ? [next[0].id] : []));
    }
  }, [value, mode]);

  const commit = (next: Block[]) => {
    setBlocks(next);
    const html = blocksToHtml(next);
    last.current = html;
    onChange(html);
  };

  const allAreas = (): AreaLink[] =>
    locations.filter((l: any) => l.slug).map((l: any) => ({ href: `/locations/${l.slug}`, label: l.name as string }));

  const useTemplate = () => {
    if (blocks.length > 1 && !confirm("Replace the current page sections with the ready-made layout?")) return;
    const next = templateBlocks(kind, name, allAreas());
    commit(next);
    setOpen(new Set(next.map((b) => b.id)));
  };

  const add = (type: BlockType) => {
    const b = type === "areas" ? { ...(emptyBlock("areas") as Extract<Block, { type: "areas" }>), links: allAreas() } : emptyBlock(type);
    const base = blocks.length ? blocks : [emptyBlock("intro")];
    commit([...base, b]);
    setOpen((s) => new Set([...s, b.id]));
    setAdding(false);
  };

  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const tabs: { id: Mode; label: string; icon: LucideIcon }[] = [
    { id: "builder", label: "Edit sections", icon: LayoutGrid },
    { id: "preview", label: "Preview", icon: Eye },
    { id: "advanced", label: "Advanced editor", icon: Code2 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg bg-muted p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === id ? "bg-background text-navy shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
        {mode === "builder" && blocks.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={useTemplate}>
            <Wand2 className="mr-1 h-4 w-4" /> Use ready-made layout
          </Button>
        )}
      </div>

      {mode === "preview" && (
        <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">How the content looks on the website</p>
          {value?.trim() ? (
            <DesignedContent html={value} pageTitle={pageTitle} />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      )}

      {mode === "advanced" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            For experienced editors. Changes here show in “Edit sections” too. Use H3 for section titles.
          </p>
          <ContentFormatGuide />
          <Suspense fallback={<div className="min-h-[440px] animate-pulse rounded-lg border border-input bg-card" />}>
            <RichTextEditor value={value} onChange={onChange} />
          </Suspense>
        </div>
      )}

      {mode === "builder" && blocks.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
          <Wand2 className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-3 font-display text-lg font-bold text-navy">Start with a ready-made layout</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            We add the standard sections (intro, cards, how it works, why choose us, areas, FAQ). You just fill in the text.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button type="button" onClick={useTemplate}>
              <Wand2 className="mr-1 h-4 w-4" /> Use ready-made layout
            </Button>
            <Button type="button" variant="outline" onClick={() => commit([emptyBlock("intro")])}>
              Start blank
            </Button>
          </div>
        </div>
      )}

      {mode === "builder" && blocks.length > 0 && (
        <div className="space-y-3">
          {blocks.map((b, i) => {
            const Icon = ICONS[b.type];
            const isOpen = open.has(b.id);
            const fixed = b.type === "intro";
            return (
              <div key={b.id} className={`overflow-hidden rounded-xl border bg-card transition-shadow ${isOpen ? "border-primary/40 shadow-sm" : "border-border"}`}>
                <div className="flex items-center gap-3 p-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${fixed ? "bg-primary text-white" : "bg-accent text-primary"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {fixed ? "Intro" : `Section ${i} · ${BLOCK_INFO[b.type].label}`}
                    </div>
                    {fixed ? (
                      <button type="button" onClick={() => toggle(b.id)} className="block w-full truncate text-left text-sm text-muted-foreground">
                        {summary(b)}
                      </button>
                    ) : (
                      <input
                        value={(b as { title: string }).title}
                        onChange={(e) => commit(blocks.map((x) => (x.id === b.id ? ({ ...x, title: e.target.value } as Block) : x)))}
                        placeholder={BRAND.examples.sectionTitle}
                        className="w-full bg-transparent font-display text-base font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted-foreground/70"
                      />
                    )}
                  </div>
                  {!fixed && !isOpen && <span className="hidden text-xs text-muted-foreground sm:block">{summary(b)}</span>}
                  <div className="flex shrink-0 items-center">
                    {!fixed && (
                      <>
                        <IconBtn onClick={() => commit(move(blocks, i, -1))} title="Move section up" disabled={i <= 1}>
                          <ArrowUp className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn onClick={() => commit(move(blocks, i, 1))} title="Move section down" disabled={i === blocks.length - 1}>
                          <ArrowDown className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn
                          onClick={() => {
                            if (confirm(`Delete the section "${(b as { title: string }).title || BLOCK_INFO[b.type].label}"?`))
                              commit(blocks.filter((x) => x.id !== b.id));
                          }}
                          title="Delete section"
                          danger
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </>
                    )}
                    <IconBtn onClick={() => toggle(b.id)} title={isOpen ? "Collapse" : "Edit"}>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </IconBtn>
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t border-border bg-background/60 p-4">
                    <BlockEditor block={b} onAdvanced={() => setMode("advanced")} onChange={(nb) => commit(blocks.map((x) => (x.id === b.id ? nb : x)))} />
                  </div>
                )}
              </div>
            );
          })}

          {adding ? (
            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-navy">Choose a section type</span>
                <IconBtn onClick={() => setAdding(false)} title="Cancel">
                  <X className="h-4 w-4" />
                </IconBtn>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(["cards", "steps", "faq", "areas", "text"] as BlockType[]).map((t) => {
                  const Icon = ICONS[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => add(t)}
                      className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-accent"
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span>
                        <span className="block text-sm font-semibold text-navy">{BLOCK_INFO[t].label}</span>
                        <span className="block text-xs text-muted-foreground">{BLOCK_INFO[t].hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-4 w-4" /> Add a section
            </button>
          )}
        </div>
      )}
    </div>
  );
}
