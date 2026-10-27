import { queryOptions } from "@tanstack/react-query";
import { listSiteImagesPublic } from "@/lib/images.functions";

export const siteImagesQuery = () =>
  queryOptions({ queryKey: ["site-images"], queryFn: () => listSiteImagesPublic() });

export type SiteImageRow = { key: string; image_url: string | null; alt: string | null };

export function pickImage(
  images: SiteImageRow[] | undefined,
  key: string,
  fallback: { src: string; alt: string },
) {
  const row = images?.find((i) => i.key === key);
  return {
    src: row?.image_url || fallback.src,
    alt: row?.alt || fallback.alt,
  };
}
