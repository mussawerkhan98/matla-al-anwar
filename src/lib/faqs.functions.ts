import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public reads (SSR-safe, no auth) ----------

export const listFaqsPublic = createServerFn({ method: "GET" })
  .inputValidator((input?: { page?: string; postSlug?: string }) =>
    z
      .object({ page: z.string().max(100).optional(), postSlug: z.string().max(200).optional() })
      .parse(input ?? {}),
  )
  .handler(async ({ data: input }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const sb = getPublicSupabase();
    // select("*") rather than naming "pages" explicitly: this column is
    // added by a migration that may not have run yet, and this function
    // is now consumed on nearly every public page — a missing-column
    // error here must never take down the whole site.
    const { data, error } = await sb
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("[faqs] listFaqsPublic error:", error.message);
      return [];
    }
    const rows = (data ?? []) as Array<{
      id: string;
      question: string;
      answer: string;
      pages?: string | null;
      blog_post_slug?: string | null;
    }>;
    // A FAQ attached to a specific blog post is scoped to that post only —
    // this takes priority over (and is independent of) the page-based
    // "pages" targeting used everywhere else.
    if (input?.postSlug) {
      return rows.filter((r) => (r.blog_post_slug ?? "").trim() === input.postSlug);
    }
    // No page filter: return everything (used by the dedicated /faq page,
    // which is meant to be the full reference list regardless of tagging).
    if (!input?.page) return rows;
    return rows.filter((r) =>
      (r.pages ?? "home,faq")
        .split(",")
        .map((p) => p.trim())
        .includes(input.page as string),
    );
  });

// ---------- Admin CRUD ----------

export const adminListFaqs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetFaq = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("faqs")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("FAQ not found");
    return row;
  });

const faqInputSchema = z.object({
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(2000),
  pages: z.string().max(500).optional().default("home,faq"),
  // Optional: ties this FAQ to one specific blog post (by slug) so it only
  // shows on that post's page, instead of / in addition to page targeting.
  blog_post_slug: z.string().max(200).optional().default(""),
  sort_order: z.number().int().default(0),
});

export const adminCreateFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => faqInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("faqs")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminUpdateFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).merge(faqInputSchema).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { id, ...update } = data;
    const { error } = await context.supabase.from("faqs").update(update).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("faqs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
