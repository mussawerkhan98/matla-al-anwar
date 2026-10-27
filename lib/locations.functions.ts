import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public reads (SSR-safe, no auth) ----------

export const listLocationsPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSupabase } = await import("./supabase-public.server");
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("locations")
    .select("*")
    .order("sort_order", { ascending: true });
  // Fail soft: if the table isn't set up yet (or any other read error),
  // return an empty list instead of throwing — this query runs on every
  // page via the root layout (footer/map), so an error here must never
  // take down the whole site.
  if (error) {
    console.error("[locations] listLocationsPublic error:", error.message);
    return [];
  }
  return data ?? [];
});

export const getLocationBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const sb = getPublicSupabase();
    const { data: row, error } = await sb
      .from("locations")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ?? null;
  });

// ---------- Admin CRUD ----------

export const adminListLocations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("locations")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetLocation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("locations")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Location not found");
    return row;
  });

const locationInputSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(150),
  arabic: z.string().max(100).optional().default(""),
  blurb: z.string().max(2000).optional().default(""),
  body_content: z.string().max(20000).optional().default(""),
  neighborhoods: z.string().max(2000).optional().default(""),
  response_time: z.string().max(100).optional().default(""),
  meta_title: z.string().max(200).optional().nullable(),
  meta_description: z.string().max(500).optional().nullable(),
  h1_override: z.string().max(200).optional().nullable(),
  google_maps_url: z.string().max(2000).optional().nullable(),
  map_x: z.number().default(50),
  map_y: z.number().default(50),
  sort_order: z.number().int().default(0),
});

export const adminCreateLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => locationInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("locations")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminUpdateLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).merge(locationInputSchema).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { id, ...update } = data;
    const { error } = await context.supabase.from("locations").update(update).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("locations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
