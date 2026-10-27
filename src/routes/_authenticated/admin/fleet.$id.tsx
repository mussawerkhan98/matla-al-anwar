import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleForm } from "./fleet.new";
import { adminGetFleetVehicle, adminUpdateFleetVehicle } from "@/lib/fleet.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/fleet/$id")({
  component: EditVehicle,
});

function EditVehicle() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetFleetVehicle);
  const updateFn = useServerFn(adminUpdateFleetVehicle);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "fleet", id],
    queryFn: () => getFn({ data: { id } }),
  });

  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "",
    capacity: "",
    temp_range: "",
    volume: "",
    ideal: "",
    image_url: null as string | null,
    alt_text: "",
    starting_price: null as number | null,
    currency: "AED",
    related_link_url: "",
    related_link_label: "",
    sort_order: 0,
  });

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        slug: data.slug,
        category: data.category,
        capacity: data.capacity,
        temp_range: data.temp_range,
        volume: data.volume,
        ideal: data.ideal,
        image_url: data.image_url,
        alt_text: data.alt_text ?? "",
        starting_price: (data as any).starting_price ?? null,
        currency: (data as any).currency ?? "AED",
        related_link_url: (data as any).related_link_url ?? "",
        related_link_label: (data as any).related_link_label ?? "",
        sort_order: data.sort_order,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => updateFn({ data: { id, ...form } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "fleet"] });
      qc.invalidateQueries({ queryKey: ["admin", "fleet", id] });
      toast.success("Package saved");
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
    <div className="p-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/fleet"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to prices
        </Link>
        <a
          href="/pricing"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View live <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <h1 className="font-display text-3xl font-bold text-navy">Edit price package</h1>

      <VehicleForm form={form} setForm={setForm} />

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => navigate({ to: "/admin/fleet" })}>
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
