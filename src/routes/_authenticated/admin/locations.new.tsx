import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, lazy, Suspense } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminCreateLocation } from "@/lib/locations.functions";
import { toast } from "sonner";

// Lazy-loaded: TipTap/ProseMirror is only needed on this admin form,
// so this keeps it out of the shared bundle every public page loads.
const RichTextEditor = lazy(() =>
  import("@/components/admin/RichTextEditor").then((m) => ({ default: m.RichTextEditor })),
);

export const Route = createFileRoute("/_authenticated/admin/locations/new")({
  component: NewLocation,
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
  arabic: string;
  blurb: string;
  body_content: string;
  neighborhoods: string;
  response_time: string;
  meta_title: string;
  meta_description: string;
  h1_override: string;
  google_maps_url: string;
  map_x: number;
  map_y: number;
  sort_order: number;
};

function NewLocation() {
  const navigate = useNavigate();
  const createFn = useServerFn(adminCreateLocation);
  const [form, setForm] = useState<FormState>({
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

  const save = useMutation({
    mutationFn: () =>
      createFn({
        data: { ...form, slug: form.slug || slugify(form.name) },
      }),
    onSuccess: ({ id }) => {
      toast.success("Location created");
      navigate({ to: "/admin/locations/$id", params: { id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <Link
        to="/admin/locations"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to locations
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">New location</h1>

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
          Save location
        </Button>
      </div>
    </div>
  );
}

export function LocationForm({
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
          placeholder="Dubai"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug (page URL)</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">/locations/</span>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="arabic">Arabic name</Label>
        <Input
          id="arabic"
          value={form.arabic}
          onChange={(e) => setForm({ ...form, arabic: e.target.value })}
          placeholder="دبي"
          dir="rtl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blurb">Short description (shown on the Locations list and hero)</Label>
        <Textarea
          id="blurb"
          rows={4}
          value={form.blurb}
          onChange={(e) => setForm({ ...form, blurb: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Full page content (unique detail shown further down this emirate's page — response times, zones, landmarks served, etc.)</Label>
        <Suspense fallback={<div className="min-h-[440px] rounded-lg border border-input bg-card animate-pulse" />}>
          <RichTextEditor
            value={form.body_content}
            onChange={(html) => setForm({ ...form, body_content: html })}
          />
        </Suspense>
      </div>
      <div className="space-y-2">
        <Label htmlFor="neighborhoods">Popular areas (comma-separated)</Label>
        <Input
          id="neighborhoods"
          value={form.neighborhoods}
          onChange={(e) => setForm({ ...form, neighborhoods: e.target.value })}
          placeholder="Deira, Downtown, Marina"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="response_time">Response time</Label>
        <Input
          id="response_time"
          value={form.response_time}
          onChange={(e) => setForm({ ...form, response_time: e.target.value })}
          placeholder="30–60 minutes"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="google_maps_url">Google Maps embed URL</Label>
        <Input
          id="google_maps_url"
          value={form.google_maps_url}
          onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
          placeholder="https://www.google.com/maps/embed?pb=..."
        />
        <p className="text-xs text-muted-foreground">
          In Google Maps: Share → Embed a map → copy just the URL inside the iframe's src=&quot;...&quot;
          (not the whole HTML snippet). Leave blank to auto-generate a generic map from the name.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="map_x">Map X position (0-100)</Label>
          <Input
            id="map_x"
            type="number"
            value={form.map_x}
            onChange={(e) => setForm({ ...form, map_x: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="map_y">Map Y position (0-100)</Label>
          <Input
            id="map_y"
            type="number"
            value={form.map_y}
            onChange={(e) => setForm({ ...form, map_y: Number(e.target.value) || 0 })}
          />
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

      <div className="space-y-5 pt-4 border-t">
        <h2 className="font-display text-lg font-bold text-navy">SEO overrides (optional)</h2>
        <div className="space-y-2">
          <Label htmlFor="h1_override">Page heading (H1) override</Label>
          <Input
            id="h1_override"
            value={form.h1_override}
            onChange={(e) => setForm({ ...form, h1_override: e.target.value })}
            placeholder={`Defaults to "Painting & Sofa Cleaning in ${form.name || "[Emirate]"}"`}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta_title">SEO title</Label>
          <Input
            id="meta_title"
            value={form.meta_title}
            onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
            placeholder="Defaults to the auto-generated location title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta_description">SEO description</Label>
          <Textarea
            id="meta_description"
            rows={2}
            value={form.meta_description}
            onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
            placeholder="Defaults to the auto-generated location description"
          />
        </div>
      </div>
    </div>
  );
}
