import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public reads (SSR-safe, no auth) ----------

export const listSiteImagesPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSupabase } = await import("./supabase-public.server");
  const sb = getPublicSupabase();
  const { data, error } = await sb.from("site_images").select("key, image_url, alt");
  if (error) throw new Error(error.message);
  return data ?? [];
});

// ---------- Admin ----------

export const adminListImages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("site_images")
      .select("*")
      .order("key", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const imageInputSchema = z.object({
  key: z.string().min(1).max(100),
  image_url: z.string().url().optional().nullable(),
  alt: z.string().max(300).optional().nullable(),
});

export const adminUpdateImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => imageInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { key, ...update } = data;
    const { error } = await context.supabase.from("site_images").update(update).eq("key", key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
