import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public reads (SSR-safe, no auth) ----------

export const listPageContentPublic = createServerFn({ method: "GET" })
  .inputValidator((input: { page_slug: string }) =>
    z.object({ page_slug: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const sb = getPublicSupabase();
    const { data: rows, error } = await sb
      .from("page_content")
      .select("id, page_slug, section_key, icon, heading, subheading, body, sort_order")
      .eq("page_slug", data.page_slug)
      .order("sort_order", { ascending: true });
    // Fail soft: this table may not exist yet in every environment, and a
    // handful of homepage/about sections depend on it — never take the
    // whole page down over missing/optional marketing copy.
    if (error) {
      console.error("[page-content] listPageContentPublic error:", error.message);
      return [];
    }
    return rows ?? [];
  });

// ---------- Admin CRUD ----------

export const adminListPageContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("page_content")
      .select("*")
      .order("page_slug", { ascending: true })
      .order("section_key", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetPageContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("page_content")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Content block not found");
    return row;
  });

const pageContentInputSchema = z.object({
  page_slug: z.string().min(1).max(100),
  section_key: z.string().min(1).max(100),
  icon: z.string().max(50).optional().nullable(),
  heading: z.string().max(300).optional().default(""),
  subheading: z.string().max(300).optional().default(""),
  body: z.string().max(2000).optional().default(""),
  sort_order: z.number().int().default(0),
});

export const adminCreatePageContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => pageContentInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("page_content")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminUpdatePageContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).merge(pageContentInputSchema).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { id, ...update } = data;
    const { error } = await context.supabase.from("page_content").update(update).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeletePageContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("page_content").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
