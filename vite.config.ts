// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// On Vercel the Supabase integration only sets SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY.
// The browser bundle reads VITE_* names, so reuse the server values when the VITE_ ones
// aren't set. (The publishable key is safe to expose in the browser.)
const define: Record<string, string> = {};
if (!process.env.VITE_SUPABASE_URL && process.env.SUPABASE_URL) {
  define["import.meta.env.VITE_SUPABASE_URL"] = JSON.stringify(process.env.SUPABASE_URL);
}
const publishable = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!process.env.VITE_SUPABASE_PUBLISHABLE_KEY && publishable) {
  define["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"] = JSON.stringify(publishable);
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: { define },
});
