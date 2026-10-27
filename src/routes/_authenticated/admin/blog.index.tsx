import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminListPosts, adminDeletePost } from "@/lib/blog.functions";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/blog/")({
  component: BlogList,
});

function BlogList() {
  const navigate = useNavigate();
  const listFn = useServerFn(adminListPosts);
  const deleteFn = useServerFn(adminDeletePost);
  const qc = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin", "posts"],
    queryFn: () => listFn(),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "posts"] });
      toast.success("Post deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div className="p-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Blog posts</h1>
          <p className="text-muted-foreground mt-1">Write, edit and publish articles.</p>
        </div>
        <Button onClick={() => navigate({ to: "/admin/blog/new" })}>
          <Plus className="h-4 w-4 mr-1" /> New post
        </Button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <p className="text-muted-foreground">No posts yet. Create your first article.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4 w-32">Status</th>
                <th className="text-left p-4 w-40">Updated</th>
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-4">
                    <div className="font-medium text-navy">{p.title}</div>
                    <div className="text-xs text-muted-foreground">/blog/{p.slug}</div>
                  </td>
                  <td className="p-4">
                    {p.published ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full px-2 py-1">
                        <Eye className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-100 rounded-full px-2 py-1">
                        <EyeOff className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {format(new Date(p.updated_at), "PP")}
                  </td>
                  <td className="p-4 flex gap-1 justify-end">
                    <Link
                      to="/admin/blog/$id"
                      params={{ id: p.id }}
                      className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${p.title}"? This cannot be undone.`))
                          del.mutate(p.id);
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
      )}
    </div>
  );
}
