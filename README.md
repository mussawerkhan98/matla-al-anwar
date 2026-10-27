# Matla Al Anwar Chiller Van Transport

Website + admin CMS (TanStack Start, React, Tailwind, Supabase), rebranded from the IQRAR Chiller Van template.

## Placeholders to replace
| What | Where |
|---|---|
| Domain `matlaalanwar.ae` | `src/lib/site.ts` (`SITE_URL`), `public/robots.txt`, `public/llms.txt`, `src/routes/__root.tsx`, `src/routes/services.$slug.tsx` |
| Phone / WhatsApp `+971 50 000 0000` | `src/lib/site.ts`, `src/routes/services.$slug.tsx`, Supabase seed (`supabase/migrations/…140116…sql`) or Admin → Settings |
| Email `info@matlaalanwar.ae` | `src/lib/site.ts`, Admin → Settings |
| Logo / favicon / OG image | `public/logo.png`, `public/logo.svg`, `public/favicon.ico`, `public/og-image.jpg` |
| Brand colours | `src/styles.css` (`--brand`, `--primary`, …) |

## Setup
1. Create a new Supabase project for Matla Al Anwar and run the SQL files in `supabase/migrations/` in order.
2. Copy `.env.example` to `.env` and fill in the Supabase URL / keys. Set `project_id` in `supabase/config.toml`.
3. `npm install && npm run dev`
4. Deploy (e.g. Vercel) with the same env vars.
