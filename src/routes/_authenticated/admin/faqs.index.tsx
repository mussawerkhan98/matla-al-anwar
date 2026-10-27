import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminListFaqs, adminDeleteFaq } from "@/lib/faqs.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/faqs/")({
  component: FaqsList,
});

function FaqsList() {
  const navigate = useNavigate();
  const listFn = useServerFn(adminListFaqs);
  const deleteFn = useServerFn(adminDeleteFaq);
  const qc = useQueryClient();

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["admin", "faqs"],
    queryFn: () => listFn(),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
      toast.success("FAQ deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div className="p-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">FAQs</h1>
          <p className="text-muted-foreground mt-1">Manage the Q&amp;A shown on the FAQ page.</p>
        </div>
        <Button onClick={() => navigate({ to: "/admin/faqs/new" })}>
          <Plus className="h-4 w-4 mr-1" /> New FAQ
        </Button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : faqs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No FAQs yet. Add your first one.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-4">Question</th>
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((f) => (
                <tr key={f.id} className="border-t border-border">
                  <td className="p-4 font-medium text-navy">{f.question}</td>
                  <td className="p-4 flex gap-1 justify-end">
                    <Link
                      to="/admin/faqs/$id"
                      params={{ id: f.id }}
                      className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Delete this FAQ? This cannot be undone.`)) del.mutate(f.id);
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
