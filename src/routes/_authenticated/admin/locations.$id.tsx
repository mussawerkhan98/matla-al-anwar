import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationForm } from "./locations.new";
import { adminGetLocation, adminUpdateLocation } from "@/lib/locations.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/locations/$id")({
  component: EditLocation,
});

function EditLocation() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetLocation);
  const updateFn = useServerFn(adminUpdateLocation);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "locations", id],
    queryFn: () => getFn({ data: { id } }),
  });

  const [form, setForm] = useState({
    name: "",
    slug: "",
    arabic: "",
    blurb: "",
    body_content: "",
    neighborhoods: "",
    response_time: "",
    meta_title: "",
    meta_description: "",
    h1_override: "",
    google_maps_url: "",
    map_x: 50,
    map_y: 50,
    sort_order: 0,
  });

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        slug: data.slug,
        arabic: data.arabic ?? "",
        blurb: data.blurb ?? "",
        body_content: data.body_content ?? "",
        neighborhoods: data.neighborhoods ?? "",
        response_time: data.response_time ?? "",
        meta_title: (data as any).meta_title ?? "",
        meta_description: (data as any).meta_description ?? "",
        h1_override: (data as any).h1_override ?? "",
        google_maps_url: (data as any).google_maps_url ?? "",
        map_x: data.map_x,
        map_y: data.map_y,
        sort_order: data.sort_order,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => updateFn({ data: { id, ...form } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "locations"] });
      qc.invalidateQueries({ queryKey: ["admin", "locations", id] });
      toast.success("Location saved");
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
      <div className="flex items-center justify-between">
        <Link
          to="/admin/locations"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to locations
        </Link>
        {form.slug && (
          <a
            href={`/locations/${form.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View live <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <h1 className="font-display text-3xl font-bold text-navy">Edit location</h1>

      <LocationForm form={form} setForm={setForm} />

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => navigate({ to: "/admin/locations" })}>
          Cancel
        </Button>
        <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name.trim()}>
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
