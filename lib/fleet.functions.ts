import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public reads (SSR-safe, no auth) ----------

export const listFleetPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSupabase } = await import("./supabase-public.server");
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("fleet_vehicles")
    .select("*")
    .order("sort_order", { ascending: true });
  // Fail soft: this runs on the homepage and /fleet, and selects columns
  // (starting_price, currency) that only exist once fleet_pricing_migration.sql
  // has been run. Never let a pending migration take down every page that
  // shows the fleet preview.
  if (error) {
    console.error("[fleet] listFleetPublic error:", error.message);
    return [];
  }
  return data ?? [];
});

// ---------- Admin CRUD ----------

export const adminListFleet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("fleet_vehicles")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetFleetVehicle = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("fleet_vehicles")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Vehicle not found");
    return row;
  });

const fleetInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes"),
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  capacity: z.string().min(1).max(100),
  temp_range: z.string().min(1).max(100),
  volume: z.string().min(1).max(100),
  ideal: z.string().min(1).max(500),
  image_url: z.string().url().optional().nullable(),
  alt_text: z.string().max(300).optional().nullable(),
  starting_price: z.number().nonnegative().optional().nullable(),
  currency: z.string().max(10).optional().default("AED"),
  related_link_url: z.string().max(500).optional().nullable(),
  related_link_label: z.string().max(150).optional().nullable(),
  sort_order: z.number().int().default(0),
});

export const adminCreateFleetVehicle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => fleetInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("fleet_vehicles")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminUpdateFleetVehicle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).merge(fleetInputSchema).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { id, ...update } = data;
    const { error } = await context.supabase.from("fleet_vehicles").update(update).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteFleetVehicle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("fleet_vehicles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
