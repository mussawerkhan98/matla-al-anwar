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
import { adminCreateIndustry } from "@/lib/industries.functions";
import { toast } from "sonner";
import { BRAND } from "@/lib/page-brand";

export const Route = createFileRoute("/_authenticated/admin/industries/new")({
  component: NewIndustry,
});

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export type IndustryFormState = {
  name: string;
  slug: string;
  description: string;
  content_html: string;
  image_url: string | null;
  image_alt: string;
  sort_order: number;
};

export const emptyIndustry: IndustryFormState = {
  name: "",
  slug: "",
  description: "",
  content_html: "",
  image_url: null,
  image_alt: "",
  sort_order: 0,
};

export function industryChecklist(f: IndustryFormState): CheckItem[] {
  const d = f.description.trim().length;
  return [
    { label: "Industry name and page URL", ok: !!f.name.trim() && !!(f.slug || slugify(f.name)) },
    { label: "Short description (120–160)", ok: d >= 120 && d <= 160, hint: "Also used as the Google description" },
    { label: "Photo added", ok: !!f.image_url },
    ...contentChecks(f.content_html),
  ];
}

export function industryPayload(form: IndustryFormState) {
  return {
    name: form.name,
    slug: form.slug || slugify(form.name),
    description: form.description,
    content_html: form.content_html,
    image_url: form.image_url,
    image_alt: form.image_alt || form.name,
    sort_order: form.sort_order,
  };
}

function NewIndustry() {
  const navigate = useNavigate();
  const createFn = useServerFn(adminCreateIndustry);
  const [form, setForm] = useState<IndustryFormState>(emptyIndustry);

  const save = useMutation({
    mutationFn: () => createFn({ data: industryPayload(form) }),
    onSuccess: ({ id }) => {
      toast.success("Industry page created");
      navigate({ to: "/admin/industries/$id", params: { id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <PageEditorShell
      backTo="/admin/industries"
      backLabel="Back to industries"
      heading="New industry page"
      subheading="Fill in the numbered steps. The checklist on the right shows what is still missing."
      checklist={industryChecklist(form)}
      saving={save.isPending}
      canSave={!!form.name.trim()}
      saveLabel="Create industry page"
      onSave={() => save.mutate()}
      onCancel={() => navigate({ to: "/admin/industries" })}
    >
      <IndustryForm form={form} setForm={setForm} />
    </PageEditorShell>
  );
}

export function IndustryForm({
  form,
  setForm,
}: {
  form: IndustryFormState;
  setForm: (f: IndustryFormState) => void;
}) {
  const path = `/industries/${form.slug || slugify(form.name) || "your-page"}`;
  return (
    <>
      <FormSection n={1} title="Basics" description="The industry name and the short text shown on the Industries list.">
        <div className="space-y-2">
          <Label htmlFor="name">Industry name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })}
            placeholder={BRAND.examples.industryName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Page address</Label>
          <div className="flex items-center overflow-hidden rounded-md border border-input bg-muted/40">
            <span className="whitespace-nowrap px-3 text-sm text-muted-foreground">{BRAND.domain.replace(/^www\./, "")}/industries/</span>
            <Input
              id="slug"
              className="rounded-none border-0 border-l bg-background"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              placeholder={BRAND.examples.industrySlug}
            />
          </div>
          <p className="text-xs text-muted-foreground">Filled in automatically from the name. Avoid changing it after the page is live.</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Short description</Label>
            <CharCount value={form.description} min={120} max={160} />
          </div>
          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Shown on the Industries list, in the page header and in Google results."
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
        <GooglePreview
          title={BRAND.industrySeoTitle(form.name || "Industry")}
          path={path}
          description={form.description}
        />
      </FormSection>

      <FormSection n={2} title="Photo" description="Shown in the page header and on the Industries list.">
        <ImageUploader value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="industries" label="Industry photo" />
        <div className="space-y-2">
          <Label htmlFor="image_alt">Describe the photo (for Google and screen readers)</Label>
          <Input
            id="image_alt"
            value={form.image_alt}
            onChange={(e) => setForm({ ...form, image_alt: e.target.value })}
            placeholder={BRAND.examples.industryImageAlt}
          />
        </div>
      </FormSection>

      <FormSection n={3} title="Page sections" description="Build the page from sections. Each one gets its own design on the website.">
        <PageBuilder
          value={form.content_html}
          onChange={(html) => setForm({ ...form, content_html: html })}
          kind="industry"
          name={form.name}
          pageTitle={form.name}
        />
      </FormSection>
    </>
  );
}
