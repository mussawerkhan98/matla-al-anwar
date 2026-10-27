import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaqForm } from "./faqs.new";
import { adminGetFaq, adminUpdateFaq } from "@/lib/faqs.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/faqs/$id")({
  component: EditFaq,
});

function EditFaq() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetFaq);
  const updateFn = useServerFn(adminUpdateFaq);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "faqs", id],
    queryFn: () => getFn({ data: { id } }),
  });

  const [form, setForm] = useState({
    question: "",
    answer: "",
    pages: "home,faq",
    blog_post_slug: "",
    sort_order: 0,
  });

  useEffect(() => {
    if (data) {
      setForm({
        question: data.question,
        answer: data.answer,
        pages: (data as any).pages ?? "home,faq",
        blog_post_slug: (data as any).blog_post_slug ?? "",
        sort_order: data.sort_order,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => updateFn({ data: { id, ...form } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
      qc.invalidateQueries({ queryKey: ["admin", "faqs", id] });
      toast.success("FAQ saved");
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
          to="/admin/faqs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to FAQs
        </Link>
        <a
          href="/faq"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View live <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <h1 className="font-display text-3xl font-bold text-navy">Edit FAQ</h1>

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
          Save changes
        </Button>
      </div>
    </div>
  );
}
