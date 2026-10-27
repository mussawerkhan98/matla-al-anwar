import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { adminCreateFleetVehicle } from "@/lib/fleet.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/fleet/new")({
  component: NewVehicle,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

type FormState = {
  name: string;
  slug: string;
  category: string;
  capacity: string;
  temp_range: string;
  volume: string;
  ideal: string;
  image_url: string | null;
  alt_text: string;
  starting_price: number | null;
  currency: string;
  related_link_url: string;
  related_link_label: string;
  sort_order: number;
};

function NewVehicle() {
  const navigate = useNavigate();
  const createFn = useServerFn(adminCreateFleetVehicle);
  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    category: "",
    capacity: "",
    temp_range: "",
    volume: "",
    ideal: "",
    image_url: null,
    alt_text: "",
    starting_price: null,
    currency: "AED",
    related_link_url: "",
    related_link_label: "",
    sort_order: 0,
  });

  const save = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          ...form,
          slug: form.slug || slugify(form.name),
          alt_text: form.alt_text || form.name,
        },
      }),
    onSuccess: ({ id }) => {
      toast.success("Package created");
      navigate({ to: "/admin/fleet/$id", params: { id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <Link
        to="/admin/fleet"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to prices
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">New price package</h1>

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
          Save package
        </Button>
      </div>
    </div>
  );
}

export function VehicleForm({
  form,
  setForm,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })
          }
          placeholder="2 Bedroom Apartment Painting"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
        />
      </div>
      <ImageUploader
        value={form.image_url}
        onChange={(url) => setForm({ ...form, image_url: url })}
        folder="fleet"
        label="Photo (optional)"
      />
      <div className="space-y-2">
        <Label htmlFor="alt_text">Photo alt text (for accessibility &amp; SEO)</Label>
        <Input
          id="alt_text"
          value={form.alt_text}
          onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
          placeholder="e.g. Freshly painted 2-bedroom apartment, Dubai Marina"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category (groups packages on the Pricing page)</Label>
          <Input
            id="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Painting  or  Sofa Cleaning"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Size / quantity</Label>
          <Input
            id="capacity"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            placeholder="2 BHK  or  3 seats"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="temp_range">Time needed</Label>
          <Input
            id="temp_range"
            value={form.temp_range}
            onChange={(e) => setForm({ ...form, temp_range: e.target.value })}
            placeholder="2 days"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="volume">What's included</Label>
          <Input
            id="volume"
            value={form.volume}
            onChange={(e) => setForm({ ...form, volume: e.target.value })}
            placeholder="Walls & ceilings, 2 coats, furniture covering"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ideal">Ideal for</Label>
        <Textarea
          id="ideal"
          rows={2}
          value={form.ideal}
          onChange={(e) => setForm({ ...form, ideal: e.target.value })}
          placeholder="Families, tenants, landlords"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="starting_price">Starting price in AED (leave blank to hide the price)</Label>
          <Input
            id="starting_price"
            type="number"
            min="0"
            step="1"
            value={form.starting_price ?? ""}
            onChange={(e) =>
              setForm({ ...form, starting_price: e.target.value === "" ? null : Number(e.target.value) })
            }
            placeholder="e.g. 350"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
            placeholder="AED"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="related_link_url">Related link (interlinking — e.g. the matching service page or a blog post)</Label>
          <Input
            id="related_link_url"
            value={form.related_link_url}
            onChange={(e) => setForm({ ...form, related_link_url: e.target.value })}
            placeholder="/blog/your-post-slug or a full https:// URL"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="related_link_label">Link text shown on the card</Label>
          <Input
            id="related_link_label"
            value={form.related_link_label}
            onChange={(e) => setForm({ ...form, related_link_label: e.target.value })}
            placeholder="e.g. Read about villa painting"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort order</Label>
        <Input
          id="sort_order"
          type="number"
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
        />
      </div>
    </div>
  );
}
