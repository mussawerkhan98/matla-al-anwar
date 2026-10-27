import { queryOptions, useQuery } from "@tanstack/react-query";
import { listSettingsPublic } from "@/lib/settings.functions";

export const settingsQuery = () =>
  queryOptions({ queryKey: ["settings"], queryFn: () => listSettingsPublic() });

/** Client-side hook with graceful fallback while loading (no suspense/loader required). */
export function useSiteSettings() {
  return useQuery({ ...settingsQuery(), staleTime: 60_000 });
}

export function getSetting(
  data: Record<string, string | null> | undefined,
  key: string,
  fallback: string,
): string {
  const value = data?.[key];
  return value && value.trim().length > 0 ? value : fallback;
}
