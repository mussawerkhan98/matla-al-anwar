/**
 * Helpers for rendering a blog post the SEO/GEO-friendly way.
 * Pure string functions, so they run the same on the server (SSR) and in the browser.
 */

export type TocItem = { id: string; text: string };
export type ArticleFaq = { question: string; answer: string };

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&ndash;": "–",
  "&mdash;": "—",
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&ldquo;": "“",
  "&rdquo;": "”",
};

export function decodeEntities(s: string) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&[a-z]+;|&#39;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

export function stripTags(html: string) {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(text: string) {
  const s = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return s || "section";
}

/** Reading time in minutes at ~220 words per minute (minimum 1). */
export function readingMinutes(words: number) {
  return Math.max(1, Math.round(words / 220));
}

/**
 * Clean up and enrich the stored article HTML:
 *  - the page keeps a single <h1> (the post title), so any <h1> in the body becomes <h2>
 *  - every h2/h3 gets a stable id for the table of contents and deep links
 *  - empty paragraphs are removed
 *  - tables are wrapped so they scroll sideways on phones
 *  - images load lazily; external links open safely in a new tab
 */
export function prepareArticle(html: string | null | undefined, siteHost: string) {
  let h = (html ?? "").trim();

  h = h.replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "");
  h = h.replace(/<h1(\s[^>]*)?>/gi, (_m, a = "") => `<h2${a}>`).replace(/<\/h1>/gi, "</h2>");

  const used = new Set<string>();
  const toc: TocItem[] = [];
  h = h.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (m, lvl: string, attrs = "", inner: string) => {
    const text = stripTags(inner);
    if (!text) return m;
    let id = (attrs.match(/\sid="([^"]+)"/i) || [])[1];
    if (!id) {
      const base = slugify(text);
      id = base;
      let n = 2;
      while (used.has(id)) id = `${base}-${n++}`;
      attrs = `${attrs} id="${id}"`;
    }
    used.add(id);
    if (lvl === "2") toc.push({ id, text });
    return `<h${lvl}${attrs}>${inner}</h${lvl}>`;
  });

  h = h.replace(/<table/gi, '<div class="post-table"><table').replace(/<\/table>/gi, "</table></div>");
  h = h.replace(/<img(?![^>]*\sloading=)/gi, '<img loading="lazy" decoding="async"');

  const host = siteHost.replace(/^www\./, "").toLowerCase();
  h = h.replace(/<a\s([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/gi, (m, pre: string, href: string, post: string) => {
    let linkHost = "";
    try {
      linkHost = new URL(href).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
      return m;
    }
    if (linkHost === host || /\btarget=/i.test(pre + post)) return m;
    return `<a ${pre}href="${href}"${post} target="_blank" rel="noopener">`;
  });

  const text = stripTags(h);
  const words = text ? text.split(" ").length : 0;
  return { html: h, toc, words, minutes: readingMinutes(words) };
}

/**
 * Pull question/answer pairs out of a "Frequently asked questions" section in the article
 * (an h2 mentioning FAQ, followed by h3 questions), for FAQPage structured data.
 */
export function extractFaqs(html: string): ArticleFaq[] {
  const sections = html.split(/(?=<h2[\s>])/i);
  const faqSection = sections.find((s) => /^<h2[^>]*>[\s\S]*?(faq|frequently asked|common questions)[\s\S]*?<\/h2>/i.test(s));
  if (!faqSection) return [];
  const body = faqSection.replace(/^<h2[^>]*>[\s\S]*?<\/h2>/i, "");
  const parts = body.split(/(?=<h3[\s>])/i);
  const faqs: ArticleFaq[] = [];
  for (const part of parts) {
    const q = part.match(/^<h3[^>]*>([\s\S]*?)<\/h3>/i);
    if (!q) continue;
    const question = stripTags(q[1]).replace(/^\d+[.)]\s*/, "");
    const answer = stripTags(part.slice(q[0].length));
    if (question && answer) faqs.push({ question, answer: answer.slice(0, 1200) });
  }
  return faqs.slice(0, 20);
}
