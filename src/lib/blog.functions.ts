import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public reads (SSR-safe, no auth) ----------

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSupabase } = await import("./supabase-public.server");
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  // Fail soft: never let a read error (e.g. a column pending migration)
  // take down the /blog list.
  if (error) {
    console.error("[blog] listPublishedPosts error:", error.message);
    return [];
  }
  return data ?? [];
});

export const getPublishedPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const sb = getPublicSupabase();
    const { data: row, error } = await sb
      .from("blog_posts")
      .select("id, slug, title, excerpt, cover_image_url, cover_image_alt, content_html, meta_title, meta_description, published_at, updated_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- Admin CRUD ----------

export const adminListPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, cover_image_url, published, published_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("blog_posts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Post not found");
    return row;
  });

const postInputSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes"),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional().nullable(),
  cover_image_url: z.string().url().optional().nullable(),
  cover_image_alt: z.string().max(300).optional().nullable(),
  content_html: z.string().default(""),
  meta_title: z.string().max(200).optional().nullable(),
  meta_description: z.string().max(500).optional().nullable(),
  published: z.boolean().default(false),
});

export const adminCreatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => postInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("blog_posts")
      .insert({
        ...data,
        author_id: context.userId,
        published_at: data.published ? new Date().toISOString() : null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminUpdatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).merge(postInputSchema).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { id, ...update } = data;
    // Set published_at when first publishing; keep original if already published.
    const { data: existing } = await context.supabase
      .from("blog_posts")
      .select("published, published_at")
      .eq("id", id)
      .maybeSingle();
    const patch = { ...update } as typeof update & { published_at?: string };
    if (update.published && (!existing?.published || !existing?.published_at)) {
      patch.published_at = new Date().toISOString();
    }
    const { error } = await context.supabase.from("blog_posts").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Media upload: return long-lived signed URL ----------

export const adminSignMediaUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path: string }) =>
    z.object({ path: z.string().min(1).max(300) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    // Sign for 10 years so the stored URL keeps working.
    const { data: signed, error } = await context.supabase.storage
      .from("media")
      .createSignedUrl(data.path, 60 * 60 * 24 * 365 * 10);
    if (error) throw new Error(error.message);
    return { signedUrl: signed.signedUrl };
  });
