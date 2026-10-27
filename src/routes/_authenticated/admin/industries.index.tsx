import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminListIndustries, adminDeleteIndustry } from "@/lib/industries.functions";
import { toast } from "sonner";
import { PageList } from "@/components/admin/PageList";

export const Route = createFileRoute("/_authenticated/admin/industries/")({
  component: IndustriesList,
});

function IndustriesList() {
  const navigate = useNavigate();
  const listFn = useServerFn(adminListIndustries);
  const deleteFn = useServerFn(adminDeleteIndustry);
  const qc = useQueryClient();

  const { data: industries = [], isLoading } = useQuery({
    queryKey: ["admin", "industries"],
    queryFn: () => listFn(),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "industries"] });
      toast.success("Industry deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div className="p-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Industries</h1>
          <p className="text-muted-foreground mt-1">
            Manage the industries shown on the Industries page.
          </p>
        </div>
        <Button onClick={() => navigate({ to: "/admin/industries/new" })}>
          <Plus className="h-4 w-4 mr-1" /> Add industry page
        </Button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : industries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <Building2 className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No industries yet. Add your first one.</p>
        </div>
      ) : (
        <PageList
          rows={industries.map((x: any) => ({ id: x.id, name: x.name, slug: x.slug, description: x.description, image_url: x.image_url, content_html: x.content_html }))}
          basePath="/industries"
          editTo="/admin/industries/$id"
          onDelete={(r) => {
            if (confirm(`Delete "${r.name}"? This removes the page from the website and cannot be undone.`)) del.mutate(r.id);
          }}
        />
      )}
    </div>
  );
}
