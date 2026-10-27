-- =====================================================================
-- Matla Al Anwar — complete database schema (fresh Supabase project)
-- Run this first, then 20261027120000_matla_seed.sql.
-- =====================================================================

-- 1. Roles ------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

-- First account to sign up becomes the admin.
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_first_admin
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Helper: standard "public read, admin write" policies + updated_at trigger.
CREATE OR REPLACE FUNCTION public._setup_cms_table(_t text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', _t);
  EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', _t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role', _t);
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', _t);
  EXECUTE format('CREATE POLICY "Public read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', _t);
  EXECUTE format('CREATE POLICY "Admins insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), ''admin''))', _t);
  EXECUTE format('CREATE POLICY "Admins update" ON public.%I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', _t);
  EXECUTE format('CREATE POLICY "Admins delete" ON public.%I FOR DELETE TO authenticated USING (public.has_role(auth.uid(), ''admin''))', _t);
  EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', _t || '_set_updated_at', _t);
END;
$$;

-- 2. Blog posts (published only for the public) -----------------------
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  cover_image_url text,
  cover_image_alt text,
  content_html text NOT NULL DEFAULT '',
  meta_title text,
  meta_description text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published posts" ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update posts" ON public.blog_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete posts" ON public.blog_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER blog_posts_set_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX blog_posts_published_idx ON public.blog_posts (published, published_at DESC);

-- 3. Price packages (table name kept as fleet_vehicles for the admin code)
--    temp_range = "time needed", volume = "what's included"
CREATE TABLE public.fleet_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  capacity text NOT NULL DEFAULT '',
  temp_range text NOT NULL DEFAULT '',
  volume text NOT NULL DEFAULT '',
  ideal text NOT NULL DEFAULT '',
  image_url text,
  alt_text text,
  starting_price numeric,
  currency text NOT NULL DEFAULT 'AED',
  related_link_label text,
  related_link_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
SELECT public._setup_cms_table('fleet_vehicles');

-- 4. Services ----------------------------------------------------------
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text,
  content_html text NOT NULL DEFAULT '',
  h1_override text,
  image_url text,
  image_alt text,
  meta_title text,
  meta_description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
SELECT public._setup_cms_table('services');

-- 5. Who we serve (industries) ----------------------------------------
CREATE TABLE public.industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  content_html text NOT NULL DEFAULT '',
  image_url text,
  image_alt text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
SELECT public._setup_cms_table('industries');

-- 6. Areas (locations) -------------------------------------------------
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  arabic text NOT NULL DEFAULT '',
  blurb text NOT NULL DEFAULT '',
  body_content text NOT NULL DEFAULT '',
  neighborhoods text NOT NULL DEFAULT '',
  response_time text NOT NULL DEFAULT '',
  map_x double precision NOT NULL DEFAULT 50,
  map_y double precision NOT NULL DEFAULT 50,
  google_maps_url text,
  h1_override text,
  meta_title text,
  meta_description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
SELECT public._setup_cms_table('locations');

-- 7. FAQs ---------------------------------------------------------------
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  pages text NOT NULL DEFAULT 'home,faq',
  blog_post_slug text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
SELECT public._setup_cms_table('faqs');

-- 8. Page content (cards, testimonials) -------------------------------
CREATE TABLE public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  section_key text NOT NULL,
  heading text NOT NULL DEFAULT '',
  subheading text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
SELECT public._setup_cms_table('page_content');
CREATE INDEX page_content_page_idx ON public.page_content (page_slug, section_key, sort_order);

-- 9. Site images (named photo slots) -----------------------------------
CREATE TABLE public.site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  image_url text,
  alt text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
SELECT public._setup_cms_table('site_images');

-- 10. Site settings (key/value) ----------------------------------------
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
SELECT public._setup_cms_table('site_settings');

DROP FUNCTION public._setup_cms_table(text);

-- 11. Media storage bucket (admin uploads) ----------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public can read media" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');
CREATE POLICY "Admins can upload media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
