import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public reads (SSR-safe, no auth) ----------

export const listIndustriesPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSupabase } = await import("./supabase-public.server");
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("industries")
    .select("id, slug, name, description, image_url, image_alt")
    .order("sort_order", { ascending: true });
  // Fail soft: never let a missing table or read error take down pages
  // that show this list (homepage marquee, industries page).
  if (error) {
    console.error("[industries] listIndustriesPublic error:", error.message);
    return [];
  }
  return data ?? [];
});

export const getIndustryBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const sb = getPublicSupabase();
    const { data: row, error } = await sb
      .from("industries")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ?? null;
  });

// ---------- Admin CRUD ----------

export const adminListIndustries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("industries")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetIndustry = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("industries")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Industry not found");
    return row;
  });

const industryInputSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(150),
  description: z.string().max(1000).optional().default(""),
  content_html: z.string().max(50000).optional().default(""),
  image_url: z.string().max(1000).optional().nullable(),
  image_alt: z.string().max(300).optional().nullable(),
  sort_order: z.number().int().default(0),
});

export const adminCreateIndustry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => industryInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("industries")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminUpdateIndustry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).merge(industryInputSchema).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { id, ...update } = data;
    const { error } = await context.supabase.from("industries").update(update).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteIndustry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("industries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
