/**
 * Page builder blocks <-> stored HTML.
 *
 * The admin edits a page as a list of simple blocks (cards, steps, FAQ...). We still store
 * plain HTML in `content_html`, in exactly the shape `parseContent` (content-sections.ts)
 * turns into the designed layout — so old content, the advanced editor and the public
 * pages all keep working.
 *
 * Text fields use a tiny, team-friendly markup:
 *   **bold**              -> bold text
 *   [label](/services/x)  -> link
 *   - item                -> bullet line
 *   blank line            -> new paragraph
 */
import { parseContent } from "./content-sections";
import { BRAND } from "./page-brand";

export type CardItem = { title: string; text: string };
export type FaqItem = { q: string; a: string };
export type AreaLink = { href: string; label: string };

export type Block =
  | { id: string; type: "intro"; heading: string; tagline: string; text: string }
  | { id: string; type: "cards"; title: string; lead: string; items: CardItem[]; after: string }
  | { id: string; type: "steps"; title: string; lead: string; items: CardItem[]; after: string }
  | { id: string; type: "faq"; title: string; items: FaqItem[] }
  | { id: string; type: "areas"; title: string; links: AreaLink[] }
  | { id: string; type: "text"; title: string; text: string }
  /** Content the simple fields can't represent (tables, images…). Kept exactly as-is. */
  | { id: string; type: "html"; title: string; html: string };

export type BlockType = Block["type"];

let seq = 0;
export const newId = () => `b${Date.now().toString(36)}${(seq++).toString(36)}`;

// ---------- text <-> html ----------

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const SAFE_URL = /^(\/|https?:\/\/|mailto:|tel:)/i;

/** Inline markup (**bold**, [label](url)) -> HTML. */
export function inlineToHtml(s: string): string {
  let out = esc(s.trim());
  out = out.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\[([^\]]+?)\]\(([^)\s]+?)\)/g, (all, label, url) =>
    SAFE_URL.test(url) ? `<a href="${url.replace(/"/g, "%22")}">${label}</a>` : all,
  );
  return out;
}

/** Multi-line markup -> paragraphs and bullet lists. */
export function textToHtml(text: string): string {
  if (!text?.trim()) return "";
  const out: string[] = [];
  for (const para of text.trim().split(/\n\s*\n/)) {
    let bullets: string[] = [];
    let lines: string[] = [];
    const flushLines = () => {
      if (lines.length) out.push(`<p>${lines.map(inlineToHtml).join("<br>")}</p>`);
      lines = [];
    };
    const flushBullets = () => {
      if (bullets.length) out.push(`<ul>${bullets.map((b) => `<li><p>${inlineToHtml(b)}</p></li>`).join("")}</ul>`);
      bullets = [];
    };
    for (const raw of para.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      const bullet = line.match(/^[-•*]\s+(.*)$/);
      if (bullet) {
        flushLines();
        bullets.push(bullet[1]);
      } else {
        flushBullets();
        lines.push(line);
      }
    }
    flushLines();
    flushBullets();
  }
  return out.join("");
}

/** HTML -> markup, so existing content can be edited in the builder. */
export function htmlToText(html: string): string {
  if (!html) return "";
  let s = html;
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_a, _t, inner) => `**${inner.replace(/<[^>]+>/g, "")}**`);
  s = s.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_a, href, label) => `[${label.replace(/<[^>]+>/g, "")}](${href})`);
  s = s.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_a, inner) => `\n\n**${inner.replace(/<[^>]+>|\*\*/g, "")}**\n\n`);
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_a, inner) => `\n- ${inner.replace(/<\/?p[^>]*>/gi, " ").trim()}`);
  s = s.replace(/<\/(ul|ol)>/gi, "\n\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/p>/gi, "\n\n");
  s = s.replace(/<[^>]+>/g, "");
  s = decode(s);
  return s
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function itemFromHtml(html: string): CardItem {
  const m = html.trim().match(/^<(strong|b)[^>]*>([\s\S]*?)<\/\1>\s*([\s\S]*)$/i);
  if (m) return { title: decode(m[2].replace(/<[^>]+>/g, "")).trim(), text: htmlToText(m[3]) };
  return { title: "", text: htmlToText(html) };
}

function itemToHtml(it: CardItem): string {
  const t = it.title.trim();
  const body = it.text.trim().replace(/\s*\n+\s*/g, " ");
  if (!t && !body) return "";
  const inner = [t ? `<strong>${esc(t)}</strong>` : "", body ? inlineToHtml(body) : ""].filter(Boolean).join(" ");
  return `<li><p>${inner}</p></li>`;
}

// ---------- blocks <-> html ----------

export function htmlToBlocks(html: string | null | undefined): Block[] {
  const { heading, tagline, intro, sections } = parseContent(html);
  const blocks: Block[] = [
    { id: newId(), type: "intro", heading: heading ?? "", tagline: tagline ?? "", text: htmlToText(intro) },
  ];
  for (const s of sections) {
    switch (s.kind) {
      case "cards":
      case "steps":
        blocks.push({
          id: newId(),
          type: s.kind,
          title: s.title,
          lead: htmlToText(s.lead),
          items: s.items.map(itemFromHtml),
          after: htmlToText(s.after),
        });
        break;
      case "faq":
        blocks.push({ id: newId(), type: "faq", title: s.title, items: s.items.map((f) => ({ q: f.q, a: htmlToText(f.a) })) });
        break;
      case "areas":
        blocks.push({ id: newId(), type: "areas", title: s.title, links: s.links });
        break;
      default:
        if (/<(table|img|blockquote|iframe|video)[\s>]/i.test(s.html)) blocks.push({ id: newId(), type: "html", title: s.title, html: s.html });
        else blocks.push({ id: newId(), type: "text", title: s.title, text: htmlToText(s.html) });
    }
  }
  return blocks;
}

export function blocksToHtml(blocks: Block[]): string {
  const out: string[] = [];
  for (const b of blocks) {
    switch (b.type) {
      case "intro":
        if (b.heading.trim()) out.push(`<h2>${esc(b.heading.trim())}</h2>`);
        if (b.tagline.trim()) out.push(`<p><strong>${esc(b.tagline.trim())}</strong></p>`);
        out.push(textToHtml(b.text));
        break;
      case "cards":
      case "steps": {
        const items = b.items.map(itemToHtml).filter(Boolean);
        out.push(`<h3>${esc(b.title.trim() || "Untitled section")}</h3>`);
        out.push(textToHtml(b.lead));
        if (items.length) out.push(b.type === "steps" ? `<ol>${items.join("")}</ol>` : `<ul>${items.join("")}</ul>`);
        out.push(textToHtml(b.after));
        break;
      }
      case "faq": {
        const items = b.items.filter((f) => f.q.trim() && f.a.trim());
        out.push(`<h3 data-block="faq">${esc(b.title.trim() || "Frequently Asked Questions")}</h3>`);
        for (const f of items) out.push(`<h4>${esc(f.q.trim())}</h4>${textToHtml(f.a)}`);
        break;
      }
      case "areas":
        out.push(`<h3 data-block="areas">${esc(b.title.trim() || "Areas We Cover")}</h3>`);
        if (b.links.length) out.push(`<p>${b.links.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join(" · ")}</p>`);
        break;
      case "text":
        out.push(`<h3>${esc(b.title.trim() || "More information")}</h3>`);
        out.push(textToHtml(b.text));
        break;
      case "html":
        out.push(`<h3>${esc(b.title.trim() || "More information")}</h3>`);
        out.push(b.html);
        break;
    }
  }
  return out.filter(Boolean).join("\n");
}

// ---------- new blocks & templates ----------

export function emptyBlock(type: BlockType): Block {
  const id = newId();
  switch (type) {
    case "intro":
      return { id, type, heading: "", tagline: "", text: "" };
    case "cards":
      return { id, type, title: "", lead: "", items: [{ title: "", text: "" }, { title: "", text: "" }, { title: "", text: "" }], after: "" };
    case "steps":
      return { id, type, title: "How It Works", lead: "", items: [{ title: "", text: "" }, { title: "", text: "" }, { title: "", text: "" }], after: "" };
    case "faq":
      return { id, type, title: "Frequently Asked Questions", items: [{ q: "", a: "" }, { q: "", a: "" }] };
    case "areas":
      return { id, type, title: "Areas We Cover", links: [] };
    case "text":
      return { id, type, title: "", text: "" };
    case "html":
      return { id, type, title: "", html: "" };
  }
}

const blank = (n: number): CardItem[] => Array.from({ length: n }, () => ({ title: "", text: "" }));

/** A ready-made page structure the team only needs to fill in. */
export function templateBlocks(kind: "service" | "industry", name: string, areas: AreaLink[]): Block[] {
  const n = name.trim() || (kind === "service" ? "this service" : "this industry");
  const intro: Block = {
    id: newId(),
    type: "intro",
    heading: "",
    tagline: BRAND.tagline,
    text: "",
  };
  const how: Block = {
    id: newId(),
    type: "steps",
    title: "How It Works",
    lead: "",
    items: BRAND.howItWorks.map((i) => ({ ...i })),
    after: "",
  };
  const why: Block = {
    id: newId(),
    type: "cards",
    title: `Why Choose ${BRAND.name}`,
    lead: "",
    items: BRAND.whyChoose.map((i) => ({ ...i })),
    after: "",
  };
  const areaBlock: Block = { id: newId(), type: "areas", title: "Areas We Cover", links: areas };
  const faq: Block = {
    id: newId(),
    type: "faq",
    title: "Frequently Asked Questions",
    items: [{ q: "", a: "" }, { q: "", a: "" }, { q: "", a: "" }],
  };
  if (kind === "service") {
    return [
      intro,
      { id: newId(), type: "cards", title: `What Our ${n} Covers`, lead: "", items: blank(4), after: "" },
      { id: newId(), type: "cards", title: "Packages & Prices", lead: "", items: blank(4), after: "" },
      how,
      why,
      areaBlock,
      faq,
    ];
  }
  return [
    intro,
    { id: newId(), type: "cards", title: `How We Support ${n}`, lead: "", items: blank(4), after: "" },
    { id: newId(), type: "cards", title: "Services We Provide", lead: "", items: blank(4), after: "" },
    why,
    areaBlock,
    faq,
  ];
}

export const BLOCK_INFO: Record<BlockType, { label: string; hint: string }> = {
  intro: { label: "Intro", hint: "Opening card at the top of the page" },
  cards: { label: "Card grid", hint: "Features, benefits, packages — shown as cards" },
  steps: { label: "Numbered steps", hint: "A process, e.g. How It Works" },
  faq: { label: "FAQ", hint: "Questions that open and close" },
  areas: { label: "Areas we cover", hint: "Emirate buttons on a dark panel" },
  text: { label: "Text block", hint: "Free text, paragraphs and bullets" },
  html: { label: "Custom content", hint: "Tables or images — edit in the Advanced editor" },
};
