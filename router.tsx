import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // Sensible defaults for a mostly-static marketing site: without this,
  // React Query's defaults (staleTime: 0, refetchOnWindowFocus: true)
  // mean every query on every page silently refetches the moment the
  // browser tab regains focus, which can re-render sections mid-scroll
  // and shift layout. Admin mutations already invalidate their own
  // queries explicitly on save, so this doesn't affect the admin panel.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
