import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostForm } from "./blog.new";
import { adminGetPost, adminUpdatePost } from "@/lib/blog.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/blog/$id")({
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetPost);
  const updateFn = useServerFn(adminUpdatePost);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "post", id],
    queryFn: () => getFn({ data: { id } }),
  });

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

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? "",
        cover_image_url: data.cover_image_url,
        cover_image_alt: (data as any).cover_image_alt ?? "",
        content_html: data.content_html ?? "",
        meta_title: data.meta_title ?? "",
        meta_description: data.meta_description ?? "",
        published: data.published,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      updateFn({
        data: {
          id,
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt || null,
          cover_image_url: form.cover_image_url,
          cover_image_alt: form.cover_image_alt || form.title,
          content_html: form.content_html,
          meta_title: form.meta_title || null,
          meta_description: form.meta_description || null,
          published: form.published,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "posts"] });
      qc.invalidateQueries({ queryKey: ["admin", "post", id] });
      toast.success("Post saved");
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
    <div className="p-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to posts
        </Link>
        {form.published && (
          <a
            href={`/blog/${form.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View live <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <h1 className="font-display text-3xl font-bold text-navy">Edit post</h1>

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
          Save changes
        </Button>
      </div>
    </div>
  );
}
