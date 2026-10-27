import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminListPageContent, adminDeletePageContent } from "@/lib/page-content.functions";
import { findSection } from "@/lib/page-content-sections";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/page-content/")({
  component: PageContentList,
});

function PageContentList() {
  const navigate = useNavigate();
  const listFn = useServerFn(adminListPageContent);
  const deleteFn = useServerFn(adminDeletePageContent);
  const qc = useQueryClient();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "page-content"],
    queryFn: () => listFn(),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "page-content"] });
      toast.success("Content block deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  // Group by page_slug + section_key so editors see each marketing
  // section (e.g. "Home — Why Matla Al Anwar cards") as its own group of cards.
  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = `${row.page_slug}::${row.section_key}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  return (
    <div className="p-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Page content</h1>
          <p className="text-muted-foreground mt-1">
            Marketing copy blocks (cards, testimonials) shown on the Home and About pages.
          </p>
        </div>
        <Button onClick={() => navigate({ to: "/admin/page-content/new" })}>
          <Plus className="h-4 w-4 mr-1" /> New content block
        </Button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No content blocks yet. If you haven't run the page_content migration, the site is
            still showing its built-in default copy — nothing is broken.
          </p>
        </div>
      ) : (
        Array.from(groups.entries()).map(([key, groupRows]) => {
          const [page_slug, section_key] = key.split("::");
          const section = findSection(page_slug, section_key);
          return (
            <div key={key} className="space-y-3">
              <h2 className="font-display text-lg font-bold text-navy">
                {section?.label ?? `${page_slug} — ${section_key}`}
              </h2>
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left p-4">Heading</th>
                      <th className="text-left p-4">Body</th>
                      <th className="w-32"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupRows
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((row) => (
                        <tr key={row.id} className="border-t border-border">
                          <td className="p-4">
                            <div className="font-medium text-navy">{row.heading || "—"}</div>
                            {row.subheading && (
                              <div className="text-xs text-muted-foreground">{row.subheading}</div>
                            )}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground line-clamp-1 max-w-md">
                            {row.body}
                          </td>
                          <td className="p-4 flex gap-1 justify-end">
                            <Link
                              to="/admin/page-content/$id"
                              params={{ id: row.id }}
                              className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${row.heading || row.section_key}"? This cannot be undone.`))
                                  del.mutate(row.id);
                              }}
                              className="h-8 w-8 rounded-md hover:bg-destructive/10 text-destructive flex items-center justify-center"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
