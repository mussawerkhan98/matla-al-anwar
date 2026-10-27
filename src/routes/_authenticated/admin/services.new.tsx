import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PageBuilder } from "@/components/admin/PageBuilder";
import {
  CharCount,
  FormSection,
  GooglePreview,
  PageEditorShell,
  contentChecks,
  type CheckItem,
} from "@/components/admin/PageEditorShell";
import { adminCreateService } from "@/lib/services.functions";
import { toast } from "sonner";
import { BRAND } from "@/lib/page-brand";

export const Route = createFileRoute("/_authenticated/admin/services/new")({
  component: NewService,
});

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export type ServiceFormState = {
  title: string;
  slug: string;
  description: string;
  content_html: string;
  image_url: string | null;
  image_alt: string;
  icon: string;
  meta_title: string;
  meta_description: string;
  h1_override: string;
  sort_order: number;
};

export const emptyService: ServiceFormState = {
  title: "",
  slug: "",
  description: "",
  content_html: "",
  image_url: null,
  image_alt: "",
  icon: "",
  meta_title: "",
  meta_description: "",
  h1_override: "",
  sort_order: 0,
};

export function serviceChecklist(f: ServiceFormState): CheckItem[] {
  const metaD = (f.meta_description || f.description).trim().length;
  return [
    { label: "Title and page URL", ok: !!f.title.trim() && !!(f.slug || slugify(f.title)) },
    { label: "Short description", ok: f.description.trim().length >= 50, hint: "At least 50 characters" },
    { label: "Photo added", ok: !!f.image_url },
    ...contentChecks(f.content_html),
    { label: "SEO title (max 60 characters)", ok: !!f.meta_title.trim() && f.meta_title.trim().length <= 60 },
    { label: "SEO description (120–160)", ok: metaD >= 120 && metaD <= 160 },
  ];
}

export function servicePayload(form: ServiceFormState) {
  return {
    title: form.title,
    slug: form.slug || slugify(form.title),
    description: form.description,
    content_html: form.content_html,
    image_url: form.image_url,
    image_alt: form.image_alt || form.title,
    icon: form.icon || null,
    meta_title: form.meta_title || null,
    meta_description: form.meta_description || null,
    h1_override: form.h1_override || null,
    sort_order: form.sort_order,
  };
}

function NewService() {
  const navigate = useNavigate();
  const createFn = useServerFn(adminCreateService);
  const [form, setForm] = useState<ServiceFormState>(emptyService);

  const save = useMutation({
    mutationFn: () => createFn({ data: servicePayload(form) }),
    onSuccess: ({ id }) => {
      toast.success("Service page created");
      navigate({ to: "/admin/services/$id", params: { id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <PageEditorShell
      backTo="/admin/services"
      backLabel="Back to services"
      heading="New service page"
      subheading="Fill in the numbered steps. The checklist on the right shows what is still missing."
      checklist={serviceChecklist(form)}
      saving={save.isPending}
      canSave={!!form.title.trim()}
      saveLabel="Create service page"
      onSave={() => save.mutate()}
      onCancel={() => navigate({ to: "/admin/services" })}
    >
      <ServiceForm form={form} setForm={setForm} />
    </PageEditorShell>
  );
}

export function ServiceForm({
  form,
  setForm,
}: {
  form: ServiceFormState;
  setForm: (f: ServiceFormState) => void;
}) {
  const path = `/services/${form.slug || slugify(form.title) || "your-page"}`;
  const name = form.title.replace(/ in Dubai and Across the UAE$/i, "");
  return (
    <>
      <FormSection n={1} title="Basics" description="The name of the service and the short text shown on the Services list.">
        <div className="space-y-2">
          <Label htmlFor="title">Service title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })}
            placeholder={BRAND.examples.serviceTitle}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Page address</Label>
          <div className="flex items-center overflow-hidden rounded-md border border-input bg-muted/40">
            <span className="whitespace-nowrap px-3 text-sm text-muted-foreground">{BRAND.domain.replace(/^www\./, "")}/services/</span>
            <Input
              id="slug"
              className="rounded-none border-0 border-l bg-background"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              placeholder={BRAND.examples.serviceSlug}
            />
          </div>
          <p className="text-xs text-muted-foreground">Filled in automatically from the title. Avoid changing it after the page is live.</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Short description</Label>
            <CharCount value={form.description} min={50} max={200} />
          </div>
          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="One or two sentences. Shown on the Services list and in the page header."
          />
        </div>
        <div className="space-y-2 sm:max-w-xs">
          <Label htmlFor="sort_order">Position in the list</Label>
          <Input
            id="sort_order"
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">Lower numbers show first.</p>
        </div>
      </FormSection>

      <FormSection n={2} title="Photo" description="Shown in the page header and on the Services list. A wide photo works best.">
        <ImageUploader value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="services" label="Service photo" />
        <div className="space-y-2">
          <Label htmlFor="image_alt">Describe the photo (for Google and screen readers)</Label>
          <Input
            id="image_alt"
            value={form.image_alt}
            onChange={(e) => setForm({ ...form, image_alt: e.target.value })}
            placeholder={BRAND.examples.serviceImageAlt}
          />
        </div>
      </FormSection>

      <FormSection n={3} title="Page sections" description="Build the page from sections. Each one gets its own design on the website.">
        <PageBuilder
          value={form.content_html}
          onChange={(html) => setForm({ ...form, content_html: html })}
          kind="service"
          name={name}
          pageTitle={form.h1_override?.trim() || form.title}
        />
      </FormSection>

      <FormSection n={4} title="Google search (SEO)" description="How the page appears in Google. If left empty, the title and short description are used.">
        <GooglePreview title={form.meta_title || form.title} path={path} description={form.meta_description || form.description} />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="meta_title">SEO title</Label>
            <CharCount value={form.meta_title} min={30} max={60} />
          </div>
          <Input
            id="meta_title"
            value={form.meta_title}
            onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
            placeholder={BRAND.examples.serviceSeoTitle}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="meta_description">SEO description</Label>
            <CharCount value={form.meta_description} min={120} max={160} />
          </div>
          <Textarea
            id="meta_description"
            rows={2}
            value={form.meta_description}
            onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
            placeholder="120–160 characters. Say what you offer, where, and invite them to get a quote."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="h1_override">Main heading on the page (optional)</Label>
          <Input
            id="h1_override"
            value={form.h1_override}
            onChange={(e) => setForm({ ...form, h1_override: e.target.value })}
            placeholder={`Leave empty to use “${form.title || "the service title"}”`}
          />
        </div>
      </FormSection>
    </>
  );
}
