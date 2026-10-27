/**
 * Turns admin rich-text HTML into structured sections so service/industry pages can be
 * rendered as designed cards instead of one long article. The team keeps editing in the
 * normal rich-text editor — the structure below decides the design:
 *
 *  - Text before the first H3            -> intro (first short bold line becomes the tagline)
 *  - H3 + bullet list                    -> grid of cards
 *  - H3 + numbered list                  -> numbered step cards
 *  - H3 containing "FAQ"/"Questions"     -> accordion (H4 or bold line = question)
 *  - H3 containing "Areas"/"Emirates"    -> clickable location chips (links in the text)
 *  - anything else                       -> nicely styled text block
 *  - paragraphs with "Request a Quote"   -> removed (the page has its own call-to-action)
 */

export type ContentSection =
  | { kind: "cards"; title: string; lead: string; items: string[]; after: string }
  | { kind: "steps"; title: string; lead: string; items: string[]; after: string }
  | { kind: "faq"; title: string; items: { q: string; a: string }[] }
  | { kind: "areas"; title: string; text: string; links: { href: string; label: string }[] }
  | { kind: "prose"; title: string; html: string };

export type ParsedContent = { heading: string | null; tagline: string | null; intro: string; sections: ContentSection[] };

const strip = (s: string) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();

function removeCtaParagraphs(html: string) {
  return html.replace(/<p[^>]*>(?:(?!<\/p>)[\s\S])*?<\/p>/gi, (p) =>
    /request a quote/i.test(strip(p)) ? "" : p,
  );
}

function listItems(listHtml: string): string[] {
  const items: string[] = [];
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(listHtml))) {
    items.push(m[1].replace(/^\s*<p[^>]*>/i, "").replace(/<\/p>\s*$/i, "").trim());
  }
  return items;
}

function parseFaq(body: string): { q: string; a: string }[] {
  // Normalise "bold-only paragraph" questions to <h4>.
  const norm = body.replace(/<p[^>]*>\s*<strong>([\s\S]*?)<\/strong>\s*<\/p>/gi, (all, inner) =>
    /\?\s*$/.test(strip(inner)) ? `<h4>${inner}</h4>` : all,
  );
  const parts = norm.split(/<h4[^>]*>/i).slice(1);
  return parts
    .map((part) => {
      const [q, ...rest] = part.split(/<\/h4>/i);
      return { q: strip(q), a: rest.join("").trim() };
    })
    .filter((f) => f.q && strip(f.a));
}

export function parseContent(rawHtml: string | null | undefined): ParsedContent {
  let html = removeCtaParagraphs(rawHtml ?? "");
  // The page already shows the H1, so drop a leading H2 that just repeats the title.
  let heading: string | null = null;
  html = html.replace(/^\s*<h[12][^>]*>([\s\S]*?)<\/h[12]>/i, (_all, h) => {
    heading = strip(h);
    return "";
  });

  // Sections are split on the page's main heading level: H2 if the page uses H2,
  // otherwise H3 (the page builder), otherwise H4 (pages written with only H4 headings).
  // The page builder marks FAQ/Areas H3s with data-block so they work whatever the heading says.
  html = html.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/gi, "<h2$1>$2</h2>");
  const has = (t: string) => new RegExp(`<${t}[\\s>]`, "i").test(html);
  const h4Count = (html.match(/<h4[\s>]/gi) || []).length;
  const level = has("h2") ? 2 : has("h3") ? 3 : h4Count >= 2 ? 4 : 3;
  if (level === 4 && heading === null) {
    html = html.replace(/^\s*<h4[^>]*>([\s\S]*?)<\/h4>/i, (_all, h) => {
      heading = strip(h);
      return "";
    });
  }
  const splitAt = (src: string, tag: string) => {
    const parts = src.split(new RegExp(`<${tag}([^>]*)>`, "i"));
    const out = [{ title: "", hint: "", body: parts[0] ?? "", subCards: false }];
    for (let i = 1; i < parts.length; i += 2) {
      const [t, ...rest] = (parts[i + 1] ?? "").split(new RegExp(`</${tag}>`, "i"));
      out.push({ title: strip(t), hint: parts[i].match(/data-block="(\w+)"/i)?.[1] ?? "", body: rest.join("").trim(), subCards: false });
    }
    return out;
  };
  const top = splitAt(html, `h${level}`);
  // With H2 sections, H3s inside either become cards (H3 + text only) or their own sections.
  const raw: { title: string; hint: string; body: string; subCards: boolean }[] = [];
  for (const c of top.slice(1)) {
    if (level !== 2 || !/<h3[\s>]/i.test(c.body)) {
      raw.push(c);
      continue;
    }
    const subs = splitAt(c.body, "h3");
    if (subs.length >= 3 && !/<(ul|ol|table)[\s>]/i.test(c.body)) {
      raw.push({ ...c, subCards: true });
      continue;
    }
    if (strip(subs[0].body)) raw.push({ ...c, body: subs[0].body });
    for (const sub of subs.slice(1)) raw.push(sub);
  }
  const chunks = [top[0].body];
  let intro = chunks[0] ?? "";
  let tagline: string | null = null;
  const tag = intro.match(/^\s*<p[^>]*>\s*<strong>([\s\S]*?)<\/strong>\s*<\/p>/i);
  if (tag && strip(tag[1]).length <= 60) {
    tagline = strip(tag[1]);
    intro = intro.slice(tag[0].length);
  }

  const sections: ContentSection[] = raw.filter((r) => r.subCards || strip(r.body) || r.title).map((r) => {
    const { hint, title, body } = r;

    if (hint === "faq" || /faq|frequently asked|questions/i.test(title)) {
      const items = parseFaq(body);
      if (items.length) return { kind: "faq", title, items };
    }
    if (hint === "areas" || /area|emirate|cover|location/i.test(title)) {
      const links: { href: string; label: string }[] = [];
      const re = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      let m: RegExpExecArray | null;
      while ((m = re.exec(body))) if (m[1].startsWith("/locations")) links.push({ href: m[1], label: strip(m[2]) });
      if (links.length >= (hint === "areas" ? 1 : 2)) return { kind: "areas", title, text: strip(body), links };
    }
    // H2 section made of several H3 sub-headings with short text -> cards.
    if (r.subCards) {
      const subs = splitAt(body, "h3");
      const items = subs.slice(1).map((sub) => {
        const text = sub.body.replace(/<\/p>\s*<p[^>]*>/gi, " ").replace(/<\/?p[^>]*>/gi, "").trim();
        return `<strong>${sub.title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</strong> ${text}`.trim();
      });
      return { kind: "cards", title, lead: subs[0].body.trim(), items, after: "" };
    }
    const list = body.match(/<(ul|ol)[^>]*>[\s\S]*?<\/\1>/i);
    if (list) {
      const idx = body.indexOf(list[0]);
      const lead = body.slice(0, idx).trim();
      const after = body.slice(idx + list[0].length).trim();
      const items = listItems(list[0]);
      if (items.length >= 2) return { kind: list[1].toLowerCase() === "ol" ? "steps" : "cards", title, lead, items, after };
    }
    return { kind: "prose", title, html: body };
  });

  return { heading, tagline, intro: intro.trim(), sections };
}
