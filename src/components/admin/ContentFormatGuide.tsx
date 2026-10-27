import { LayoutGrid, ListOrdered, HelpCircle, MapPin, Sparkles } from "lucide-react";

/**
 * Explains how the rich-text content is turned into the designed page layout,
 * so the team can add or change sections without touching code.
 */
export function ContentFormatGuide() {
  const rules = [
    { icon: Sparkles, t: "Intro", d: "Text before the first H3 shows in the intro card. A short bold first line (e.g. your slogan) becomes the coloured tagline." },
    { icon: LayoutGrid, t: "H3 + bullet list", d: "Shows as a grid of cards. A bullet that is only a link becomes a clickable card with an arrow." },
    { icon: ListOrdered, t: "H3 + numbered list", d: "Shows as numbered step cards — good for “How it works”." },
    { icon: HelpCircle, t: "H3 named “Frequently Asked Questions”", d: "Each H4 (or a bold line ending in ?) becomes a question in a dropdown, with the text below it as the answer." },
    { icon: MapPin, t: "H3 named “Areas We Cover”", d: "Links to emirate pages become location buttons on a dark panel." },
  ];
  return (
    <details className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
      <summary className="cursor-pointer font-medium text-navy">How this content is designed on the website (click to read)</summary>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {rules.map(({ icon: Icon, t, d }) => (
          <li key={t} className="flex gap-2 rounded-md bg-card p-2.5 ring-1 ring-border">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              <span className="font-semibold text-navy">{t}:</span> <span className="text-muted-foreground">{d}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Any other H3 section shows as a white text card. Paragraphs containing “Request a Quote” are hidden because the page already has quote buttons. The page title, short description and photo above appear in the dark header at the top.
      </p>
    </details>
  );
}
