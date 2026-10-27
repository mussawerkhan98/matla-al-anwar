import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageEditorShell } from "@/components/admin/PageEditorShell";
import { ServiceForm, emptyService, serviceChecklist, servicePayload, type ServiceFormState } from "./services.new";
import { adminGetService, adminUpdateService } from "@/lib/services.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/services/$id")({
  component: EditService,
});

function EditService() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetService);
  const updateFn = useServerFn(adminUpdateService);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "services", id],
    queryFn: () => getFn({ data: { id } }),
  });

  const [form, setForm] = useState<ServiceFormState>(emptyService);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title,
        slug: data.slug ?? "",
        description: data.description,
        content_html: data.content_html ?? "",
        image_url: data.image_url ?? null,
        image_alt: data.image_alt ?? "",
        icon: data.icon ?? "",
        meta_title: (data as any).meta_title ?? "",
        meta_description: (data as any).meta_description ?? "",
        h1_override: (data as any).h1_override ?? "",
        sort_order: data.sort_order,
      });
      setReady(true);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => updateFn({ data: { id, ...servicePayload(form) } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
      qc.invalidateQueries({ queryKey: ["admin", "services", id] });
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
      backTo="/admin/services"
      backLabel="Back to services"
      heading="Edit service page"
      subheading={form.title}
      viewHref={form.slug ? `/services/${form.slug}` : undefined}
      checklist={serviceChecklist(form)}
      saving={save.isPending}
      canSave={!!form.title.trim()}
      saveLabel="Save changes"
      onSave={() => save.mutate()}
      onCancel={() => navigate({ to: "/admin/services" })}
    >
      <ServiceForm form={form} setForm={setForm} />
    </PageEditorShell>
  );
}
