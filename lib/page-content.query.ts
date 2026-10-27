import { queryOptions } from "@tanstack/react-query";
import { listPageContentPublic } from "@/lib/page-content.functions";

export const pageContentQuery = (pageSlug: string) =>
  queryOptions({
    queryKey: ["page-content", pageSlug],
    queryFn: () => listPageContentPublic({ data: { page_slug: pageSlug } }),
  });

export type PageContentRow = Awaited<ReturnType<typeof listPageContentPublic>>[number];

export function contentForSection(rows: PageContentRow[], sectionKey: string): PageContentRow[] {
  return rows.filter((r) => r.section_key === sectionKey);
}
