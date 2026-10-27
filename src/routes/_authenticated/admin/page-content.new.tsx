import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminCreatePageContent } from "@/lib/page-content.functions";
import { KNOWN_SECTIONS } from "@/lib/page-content-sections";
import { ICON_OPTIONS } from "@/lib/icon-map";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/page-content/new")({
  component: NewPageContent,
});

type FormState = {
  page_slug: string;
  section_key: string;
  icon: string;
  heading: string;
  subheading: string;
  body: string;
  sort_order: number;
};

function NewPageContent() {
  const navigate = useNavigate();
  const createFn = useServerFn(adminCreatePageContent);
  const [form, setForm] = useState<FormState>({
    page_slug: KNOWN_SECTIONS[0].page_slug,
    section_key: KNOWN_SECTIONS[0].section_key,
    icon: "",
    heading: "",
    subheading: "",
    body: "",
    sort_order: 0,
  });

  const save = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          page_slug: form.page_slug,
          section_key: form.section_key,
          icon: form.icon || null,
          heading: form.heading,
          subheading: form.subheading,
          body: form.body,
          sort_order: form.sort_order,
        },
      }),
    onSuccess: ({ id }) => {
      toast.success("Content block created");
      navigate({ to: "/admin/page-content/$id", params: { id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <Link
        to="/admin/page-content"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to page content
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">New content block</h1>

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
          Save
        </Button>
      </div>
    </div>
  );
}

export function PageContentForm({
  form,
  setForm,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
}) {
  const section = KNOWN_SECTIONS.find(
    (s) => s.page_slug === form.page_slug && s.section_key === form.section_key,
  );
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="section">Section</Label>
        <select
          id="section"
          value={`${form.page_slug}::${form.section_key}`}
          onChange={(e) => {
            const [page_slug, section_key] = e.target.value.split("::");
            setForm({ ...form, page_slug, section_key });
          }}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {KNOWN_SECTIONS.map((s) => (
            <option key={`${s.page_slug}::${s.section_key}`} value={`${s.page_slug}::${s.section_key}`}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Adding a block here adds one more card/item to that section — it doesn't replace the
          others already in it.
        </p>
      </div>

      {section?.fieldHints.icon && (
        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <select
            id="icon"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Default (sparkles)</option>
            {ICON_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="heading">{section?.fieldHints.heading ?? "Heading"}</Label>
        <Input
          id="heading"
          value={form.heading}
          onChange={(e) => setForm({ ...form, heading: e.target.value })}
        />
      </div>

      {section?.fieldHints.subheading !== "(unused)" && (
        <div className="space-y-2">
          <Label htmlFor="subheading">{section?.fieldHints.subheading ?? "Subheading"}</Label>
          <Input
            id="subheading"
            value={form.subheading}
            onChange={(e) => setForm({ ...form, subheading: e.target.value })}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="body">{section?.fieldHints.body ?? "Body"}</Label>
        <Textarea
          id="body"
          rows={4}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort order (lower shows first)</Label>
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
