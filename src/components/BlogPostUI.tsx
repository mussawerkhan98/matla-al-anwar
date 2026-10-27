import { useEffect, useRef, useState } from "react";
import { Check, Link2, ListOrdered } from "lucide-react";
import type { TocItem } from "@/lib/blog-article";

/** Thin bar at the top of the screen that fills as the reader scrolls through the article. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setP(Math.min(1, Math.max(0, total > 0 ? -r.top / total : 0)));
    };
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [targetId]);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-transparent" aria-hidden>
      <div className="h-full origin-left gradient-brand transition-transform duration-150" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    if (!ids.length) return;
    let raf = 0;
    // The current section is the last heading that has scrolled above the reading line.
    const update = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top < 150) current = id;
        else break;
      }
      setActive(current);
    };
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [ids.join("|")]);
  return active;
}

/** "On this page" list. Desktop: sticky sidebar with the current section highlighted. */
export function TocNav({ items }: { items: TocItem[] }) {
  const active = useActiveHeading(items.map((i) => i.id));
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`a[href="#${CSS.escape(active)}"]`);
    if (!list || !link) return;
    const top = link.offsetTop; // the list is position:relative, so this is relative to it
    if (top < list.scrollTop || top + link.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: Math.max(0, top - list.clientHeight / 3), behavior: "smooth" });
    }
  }, [active]);
  if (items.length < 2) return null;
  return (
    <nav aria-label="On this page" className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
        <ListOrdered className="h-3.5 w-3.5" /> On this page
      </p>
      <ol ref={listRef} className="relative mt-3 max-h-[52vh] space-y-0.5 overflow-y-auto border-l-2 border-border pr-1">
        {items.map((t, i) => (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              className={`-ml-0.5 flex gap-2 border-l-2 py-1.5 pl-3 text-[13px] leading-snug transition-colors ${
                active === t.id ? "border-primary bg-primary/5 font-semibold text-primary" : "border-transparent text-muted-foreground hover:text-navy"
              }`}
            >
              <span className="tabular-nums opacity-60">{String(i + 1).padStart(2, "0")}</span>
              <span>{t.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Phones/tablets: a collapsible "In this guide" box above the article. */
export function TocMobile({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;
  return (
    <details className="post-toc-mobile group rounded-2xl border border-border bg-card shadow-card lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display text-sm font-bold text-navy">
        <span className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-primary" /> In this guide · {items.length} sections
        </span>
        <span className="text-primary transition-transform group-open:rotate-45">+</span>
      </summary>
      <ol className="space-y-1 border-t border-border px-5 py-4">
        {items.map((t, i) => (
          <li key={t.id}>
            <a href={`#${t.id}`} className="flex gap-2.5 py-1.5 text-sm text-muted-foreground active:text-primary">
              <span className="tabular-nums text-primary/70">{String(i + 1).padStart(2, "0")}</span>
              {t.text}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

/** Share links (no third-party scripts). */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, short: "WA" },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, short: "in" },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, short: "X" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, short: "f" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Share</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${l.label}`}
          className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-border bg-card px-2.5 text-xs font-bold text-navy transition-colors hover:border-primary hover:text-primary"
        >
          {l.short}
        </a>
      ))}
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(url).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          });
        }}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-bold text-navy transition-colors hover:border-primary hover:text-primary"
        aria-label="Copy link"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
