// Server-only helper: assert the current authenticated user has the admin role.
// Import ONLY inside createServerFn handlers (never at module top of a route file).
import type { SupabaseClient } from "@supabase/supabase-js";

export async function assertAdmin(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}
