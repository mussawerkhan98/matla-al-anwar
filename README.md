# Matla Al Anwar — Painting & Sofa Cleaning

Website + admin panel for **Matla Al Anwar** (painting and sofa cleaning, all 7 UAE emirates).
Built with TanStack Start, React, Tailwind and Supabase.

## Pages
Home · About · Services (6 service pages) · Pricing · Who We Serve (8 pages) · Areas (7 emirate pages) · Blog (4 starter articles) · FAQ · Contact (WhatsApp quote form) · `/admin` CMS

## Setup
1. Create a new Supabase project.
2. In Supabase → SQL Editor, run in order:
   - `supabase/migrations/20261027110000_matla_schema.sql` (tables, security, storage)
   - `supabase/migrations/20261027120000_matla_seed.sql` (all starter content)
3. Copy `.env.example` to `.env` (and add the same variables in Vercel) with your Supabase URL and publishable key.
4. `npm install && npm run dev`
5. Open `/auth` and create an account — **the first account becomes the admin**.

## Placeholders to replace
| What | Where |
|---|---|
| Phone / WhatsApp `+971 50 000 0000` | Admin → Settings (and `src/lib/site.ts` as fallback) |
| Email `info@matlaalanwar.com` | Admin → Settings / `src/lib/site.ts` |
| Domain `matlaalanwar.com` | `src/lib/site.ts` (`SITE_URL`), `public/robots.txt`, `public/llms.txt` |
| Photos (illustrations for now) | Admin → Site Photos, plus a photo per service / price package |
| Prices | Admin → Prices |
| Customer reviews | Admin → Page Content → Home — Testimonials (section stays hidden until you add real reviews) |

Brand colours come from the MA logo: `src/styles.css`.
