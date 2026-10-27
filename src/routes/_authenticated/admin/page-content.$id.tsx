import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContentForm } from "./page-content.new";
import { adminGetPageContent, adminUpdatePageContent } from "@/lib/page-content.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/page-content/$id")({
  component: EditPageContent,
});

function EditPageContent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetPageContent);
  const updateFn = useServerFn(adminUpdatePageContent);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "page-content", id],
    queryFn: () => getFn({ data: { id } }),
  });

  const [form, setForm] = useState({
    page_slug: "",
    section_key: "",
    icon: "",
    heading: "",
    subheading: "",
    body: "",
    sort_order: 0,
  });

  useEffect(() => {
    if (data) {
      setForm({
        page_slug: data.page_slug,
        section_key: data.section_key,
        icon: data.icon ?? "",
        heading: data.heading ?? "",
        subheading: data.subheading ?? "",
        body: data.body ?? "",
        sort_order: data.sort_order,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      updateFn({
        data: {
          id,
          page_slug: form.page_slug,
          section_key: form.section_key,
          icon: form.icon || null,
          heading: form.heading,
          subheading: form.subheading,
          body: form.body,
          sort_order: form.sort_order,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "page-content"] });
      qc.invalidateQueries({ queryKey: ["admin", "page-content", id] });
      // Also refresh the public page-content caches so the front-end
      // reflects the edit without a hard reload.
      qc.invalidateQueries({ queryKey: ["page-content"] });
      toast.success("Content block saved");
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

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <Link
        to="/admin/page-content"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to page content
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">Edit content block</h1>

      <PageContentForm form={form} setForm={setForm} />

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => navigate({ to: "/admin/page-content" })}>
          Cancel
        </Button>
        <Button onClick={() => save.mutate()} disabled={save.isPending || !form.heading.trim()}>
          {save.isPending ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          Save changes
        </Button>
      </div>
    </div>
  );
}
