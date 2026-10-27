import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public reads (SSR-safe, no auth) ----------

export const listServicesPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSupabase } = await import("./supabase-public.server");
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  // Fail soft: runs on the homepage and /services list, which must never
  // go down over a read error.
  if (error) {
    console.error("[services] listServicesPublic error:", error.message);
    return [];
  }
  return data ?? [];
});

export const getServiceBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const sb = getPublicSupabase();
    const { data: row, error } = await sb
      .from("services")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ?? null;
  });

// ---------- Admin CRUD ----------

export const adminListServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetService = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("services")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Service not found");
    return row;
  });

const serviceInputSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(150),
  description: z.string().min(1).max(1000),
  content_html: z.string().max(50000).optional().default(""),
  image_url: z.string().max(1000).optional().nullable(),
  image_alt: z.string().max(300).optional().nullable(),
  icon: z.string().max(100).optional().nullable(),
  meta_title: z.string().max(200).optional().nullable(),
  meta_description: z.string().max(500).optional().nullable(),
  h1_override: z.string().max(200).optional().nullable(),
  sort_order: z.number().int().default(0),
});

export const adminCreateService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => serviceInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("services")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminUpdateService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).merge(serviceInputSchema).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { id, ...update } = data;
    const { error } = await context.supabase.from("services").update(update).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
