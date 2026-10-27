import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminCreateFaq } from "@/lib/faqs.functions";
import { adminListPosts } from "@/lib/blog.functions";
import { FAQ_PAGE_OPTIONS, pagesToArray, arrayToPages } from "@/lib/faq-pages";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/faqs/new")({
  component: NewFaq,
});

type FormState = {
  question: string;
  answer: string;
  pages: string;
  blog_post_slug: string;
  sort_order: number;
};

function NewFaq() {
  const navigate = useNavigate();
  const createFn = useServerFn(adminCreateFaq);
  const [form, setForm] = useState<FormState>({
    question: "",
    answer: "",
    pages: "home,faq",
    blog_post_slug: "",
    sort_order: 0,
  });

  const save = useMutation({
    mutationFn: () => createFn({ data: form }),
    onSuccess: ({ id }) => {
      toast.success("FAQ created");
      navigate({ to: "/admin/faqs/$id", params: { id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <Link
        to="/admin/faqs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to FAQs
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">New FAQ</h1>

      <FaqForm form={form} setForm={setForm} />

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => navigate({ to: "/admin/faqs" })}>
          Cancel
        </Button>
        <Button onClick={() => save.mutate()} disabled={save.isPending || !form.question.trim()}>
          {save.isPending ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          Save FAQ
        </Button>
      </div>
    </div>
  );
}

export function FaqForm({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          placeholder="What temperature ranges do you handle?"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="answer">Answer</Label>
        <Textarea
          id="answer"
          rows={4}
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Show this FAQ on</Label>
        <div className="grid grid-cols-2 gap-2 rounded-md border border-input p-3">
          {FAQ_PAGE_OPTIONS.map((opt) => {
            const selected = pagesToArray(form.pages);
            const checked = selected.includes(opt.slug);
            return (
              <label key={opt.slug} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selected, opt.slug]
                      : selected.filter((p) => p !== opt.slug);
                    setForm({ ...form, pages: arrayToPages(next) });
                  }}
                  className="h-4 w-4 rounded border-input"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Pick every page this Q&amp;A should appear on. It can be shown on more than one.
        </p>
      </div>
      <BlogPostPicker
        value={form.blog_post_slug}
        onChange={(slug) => setForm({ ...form, blog_post_slug: slug })}
      />
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

function BlogPostPicker({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
  const listPostsFn = useServerFn(adminListPosts);
  const { data: posts = [] } = useQuery({
    queryKey: ["admin", "blog", "posts", "forFaqPicker"],
    queryFn: () => listPostsFn(),
  });

  return (
    <div className="space-y-2">
      <Label htmlFor="blog_post_slug">Attach to a specific blog post (optional)</Label>
      <select
        id="blog_post_slug"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">None — use page targeting above instead</option>
        {posts.map((p) => (
          <option key={p.id} value={p.slug}>
            {p.title}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        If set, this FAQ only shows on that specific blog post's page, regardless of the page checkboxes above.
      </p>
    </div>
  );
}
