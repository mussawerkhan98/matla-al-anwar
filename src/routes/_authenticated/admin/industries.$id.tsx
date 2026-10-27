import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageEditorShell } from "@/components/admin/PageEditorShell";
import { IndustryForm, emptyIndustry, industryChecklist, industryPayload, type IndustryFormState } from "./industries.new";
import { adminGetIndustry, adminUpdateIndustry } from "@/lib/industries.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/industries/$id")({
  component: EditIndustry,
});

function EditIndustry() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetIndustry);
  const updateFn = useServerFn(adminUpdateIndustry);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "industries", id],
    queryFn: () => getFn({ data: { id } }),
  });

  const [form, setForm] = useState<IndustryFormState>(emptyIndustry);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        slug: data.slug,
        description: data.description,
        content_html: data.content_html ?? "",
        image_url: data.image_url ?? null,
        image_alt: (data as any).image_alt ?? "",
        sort_order: data.sort_order,
      });
      setReady(true);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => updateFn({ data: { id, ...industryPayload(form) } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "industries"] });
      qc.invalidateQueries({ queryKey: ["admin", "industries", id] });
      toast.success("Changes saved — the live page is updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  if (isLoading || !ready) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <PageEditorShell
      backTo="/admin/industries"
      backLabel="Back to industries"
      heading="Edit industry page"
      subheading={form.name}
      viewHref={form.slug ? `/industries/${form.slug}` : undefined}
      checklist={industryChecklist(form)}
      saving={save.isPending}
      canSave={!!form.name.trim()}
      saveLabel="Save changes"
      onSave={() => save.mutate()}
      onCancel={() => navigate({ to: "/admin/industries" })}
    >
      <IndustryForm form={form} setForm={setForm} />
    </PageEditorShell>
  );
}
