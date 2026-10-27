import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, lazy, Suspense } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { adminCreatePost } from "@/lib/blog.functions";
import { toast } from "sonner";

// Lazy-loaded: TipTap/ProseMirror is only needed on this admin form,
// so this keeps it out of the shared bundle every public page loads.
const RichTextEditor = lazy(() =>
  import("@/components/admin/RichTextEditor").then((m) => ({ default: m.RichTextEditor })),
);

export const Route = createFileRoute("/_authenticated/admin/blog/new")({
  component: NewPost,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function NewPost() {
  const navigate = useNavigate();
  const createFn = useServerFn(adminCreatePost);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    cover_image_url: null as string | null,
    cover_image_alt: "",
    content_html: "",
    meta_title: "",
    meta_description: "",
    published: false,
  });

  const save = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          title: form.title,
          slug: form.slug || slugify(form.title),
          excerpt: form.excerpt || null,
          cover_image_url: form.cover_image_url,
          cover_image_alt: form.cover_image_alt || form.title,
          content_html: form.content_html,
          meta_title: form.meta_title || null,
          meta_description: form.meta_description || null,
          published: form.published,
        },
      }),
    onSuccess: ({ id }) => {
      toast.success("Post created");
      navigate({ to: "/admin/blog/$id", params: { id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <Link
        to="/admin/blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to posts
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">New blog post</h1>

      <PostForm form={form} setForm={setForm} />

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => navigate({ to: "/admin/blog" })}>
          Cancel
        </Button>
        <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title.trim()}>
          {save.isPending ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          Save post
        </Button>
      </div>
    </div>
  );
}

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  cover_image_alt: string;
  content_html: string;
  meta_title: string;
  meta_description: string;
  published: boolean;
};

export function PostForm({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })
          }
          placeholder="How much does it cost to paint a villa in Dubai?"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">/blog/</span>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
          />
        </div>
      </div>
      <ImageUploader
        value={form.cover_image_url}
        onChange={(url) => setForm({ ...form, cover_image_url: url })}
        folder="blog/covers"
        label="Cover image"
      />
      <div className="space-y-2">
        <Label htmlFor="cover_image_alt">Cover image alt text (for accessibility &amp; SEO)</Label>
        <Input
          id="cover_image_alt"
          value={form.cover_image_alt}
          onChange={(e) => setForm({ ...form, cover_image_alt: e.target.value })}
          placeholder="e.g. Painter rolling a fresh coat on a villa living-room wall"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt (short summary shown in the blog list)</Label>
        <Textarea
          id="excerpt"
          rows={3}
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Content</Label>
        <Suspense fallback={<div className="min-h-[440px] rounded-lg border border-input bg-card animate-pulse" />}>
          <RichTextEditor
            value={form.content_html}
            onChange={(html) => setForm({ ...form, content_html: html })}
          />
        </Suspense>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 pt-4 border-t">
        <div className="space-y-2">
          <Label htmlFor="meta_title">SEO title</Label>
          <Input
            id="meta_title"
            value={form.meta_title}
            onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
            placeholder="Defaults to post title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta_description">SEO description</Label>
          <Input
            id="meta_description"
            value={form.meta_description}
            onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
            placeholder="Defaults to excerpt"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Switch
          id="published"
          checked={form.published}
          onCheckedChange={(v) => setForm({ ...form, published: v })}
        />
        <Label htmlFor="published" className="cursor-pointer">
          {form.published ? "Published (visible on the site)" : "Draft (hidden from visitors)"}
        </Label>
      </div>
    </div>
  );
}
