import { Link } from "@tanstack/react-router";
import { ExternalLink, ImageOff, Pencil, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { parseContent } from "@/lib/content-sections";

export type PageRow = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  content_html: string | null;
};

function status(r: PageRow) {
  const { sections } = parseContent(r.content_html);
  const checks = [!!r.image_url, (r.description ?? "").trim().length >= 50, sections.length >= 3, sections.some((s) => s.kind === "faq")];
  const done = checks.filter(Boolean).length;
  if (done === checks.length) return { label: "Complete", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
  if (sections.length === 0) return { label: "No page content", cls: "bg-red-50 text-red-700 ring-red-200" };
  return { label: `${done} of ${checks.length} done`, cls: "bg-amber-50 text-amber-700 ring-amber-200" };
}

/** Friendly list of service/industry pages with photo, status and quick actions. */
export function PageList({
  rows,
  basePath,
  editTo,
  onDelete,
}: {
  rows: PageRow[];
  basePath: "/services" | "/industries";
  editTo: "/admin/services/$id" | "/admin/industries/$id";
  onDelete: (row: PageRow) => void;
}) {
  const [q, setQ] = useState("");
  const shown = rows.filter((r) => `${r.name} ${r.slug ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="space-y-4">
      {rows.length > 5 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pages…" className="pl-9" />
        </div>
      )}
      <div className="grid gap-3">
        {shown.map((r) => {
          const st = status(r);
          return (
            <div key={r.id} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 pr-4 shadow-sm transition-colors hover:border-primary/40">
              <Link to={editTo} params={{ id: r.id }} className="flex min-w-0 flex-1 items-center gap-4">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {r.image_url ? (
                    <img src={r.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageOff className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold text-navy group-hover:text-primary">{r.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${st.cls}`}>{st.label}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {basePath}/{r.slug}
                  </div>
                  {r.description && <div className="mt-1 line-clamp-1 text-sm text-muted-foreground">{r.description}</div>}
                </div>
              </Link>
              <div className="flex shrink-0 items-center gap-1">
                {r.slug && (
                  <a
                    href={`${basePath}/${r.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    title="View live page"
                    className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <Link
                  to={editTo}
                  params={{ id: r.id }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-medium text-navy hover:bg-primary hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(r)}
                  title="Delete"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {shown.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No pages match “{q}”.</p>}
      </div>
    </div>
  );
}
