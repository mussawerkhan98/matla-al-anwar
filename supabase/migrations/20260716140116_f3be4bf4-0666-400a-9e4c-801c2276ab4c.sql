
-- ==========================================
-- 1. Roles system
-- ==========================================
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

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ==========================================
-- 2. First-signup-becomes-admin trigger
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_first_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

-- ==========================================
-- 3. Shared updated_at trigger
-- ==========================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ==========================================
-- 4. Blog posts
-- ==========================================
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  cover_image_url text,
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

CREATE POLICY "Public can read published posts"
  ON public.blog_posts FOR SELECT
  TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert posts"
  ON public.blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts"
  ON public.blog_posts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts"
  ON public.blog_posts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER blog_posts_set_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX blog_posts_published_idx ON public.blog_posts (published, published_at DESC);

-- ==========================================
-- 5. Fleet vehicles
-- ==========================================
CREATE TABLE public.fleet_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  capacity text NOT NULL,
  temp_range text NOT NULL,
  volume text NOT NULL,
  ideal text NOT NULL,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.fleet_vehicles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.fleet_vehicles TO authenticated;
GRANT ALL ON public.fleet_vehicles TO service_role;
ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read fleet" ON public.fleet_vehicles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert fleet" ON public.fleet_vehicles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update fleet" ON public.fleet_vehicles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete fleet" ON public.fleet_vehicles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER fleet_vehicles_set_updated_at BEFORE UPDATE ON public.fleet_vehicles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- 6. Services
-- ==========================================
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read services" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update services" ON public.services FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete services" ON public.services FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER services_set_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- 7. FAQs
-- ==========================================
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read faqs" ON public.faqs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert faqs" ON public.faqs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update faqs" ON public.faqs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete faqs" ON public.faqs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER faqs_set_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- 8. Site images (keyed slots)
-- ==========================================
CREATE TABLE public.site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  image_url text,
  alt text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_images TO authenticated;
GRANT ALL ON public.site_images TO service_role;
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site images" ON public.site_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert site images" ON public.site_images FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update site images" ON public.site_images FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete site images" ON public.site_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_images_set_updated_at BEFORE UPDATE ON public.site_images FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- 9. Site settings (key/value)
-- ==========================================
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete site settings" ON public.site_settings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- 10. Seed initial fleet, services, faqs, image slots
-- ==========================================
INSERT INTO public.fleet_vehicles (slug, name, category, capacity, temp_range, volume, ideal, sort_order) VALUES
  ('toyota-hiace-chiller','Toyota Hiace Chiller Van','Compact Chiller','1 Ton','+2°C to +8°C','6.5 m³','City deliveries, catering, dairy, floral',10),
  ('nissan-urvan-chiller','Nissan Urvan Chiller Van','Compact Chiller','1.2 Ton','+2°C to +8°C','7.2 m³','Restaurant supply, pharmacy, medical',20),
  ('pickup-chiller','1 Ton Pickup Chiller','Pickup','1 Ton','0°C to +8°C','5 m³','Quick same-day runs, small loads',30),
  ('3-ton-chiller-truck','3 Ton Chiller Truck','Chiller Truck','3 Tons','0°C to +10°C','16 m³','Bulk supermarket, hotels, wholesale',40),
  ('5-ton-chiller-truck','5 Ton Chiller Truck','Chiller Truck','5 Tons','0°C to +10°C','24 m³','Cross-emirate bulk transport',50),
  ('freezer-truck','Freezer Truck (Deep Freeze)','Freezer','3–7 Tons','−18°C to −25°C','16–28 m³','Ice cream, frozen meat, seafood, pharma',60);

INSERT INTO public.services (title, description, sort_order) VALUES
  ('Food & Beverage Transport','Fresh produce, dairy, prepared meals and beverages moved at precise temperatures.',10),
  ('Frozen Food Logistics','Deep-freeze fleet from −18°C to −25°C for ice cream, ready meals and desserts.',20),
  ('Seafood & Meat Delivery','HACCP-aligned handling for fish, poultry and red meat from port to plate.',30),
  ('Pharmaceutical & Medical','Cold-chain integrity for medicines, vaccines, samples and lab supplies.',40),
  ('Chocolate & Confectionery','Gentle chilled transport that preserves texture, sheen and flavor.',50),
  ('Floral & Live Plants','Humidity-friendly chill zones for flowers, bouquets and event installations.',60),
  ('Hotels, Restaurants & Catering','Reliable daily supply routes for hospitality and F&B operators.',70),
  ('Supermarket Distribution','Scheduled multi-drop chilled and frozen distribution across the UAE.',80),
  ('Airport & Port Cargo','Time-critical cold cargo runs to DXB, DWC, AUH and Jebel Ali.',90);

INSERT INTO public.faqs (question, answer, sort_order) VALUES
  ('What temperature ranges do you handle?','Our chiller vans maintain +2°C to +8°C for fresh goods and pharmaceuticals, while our freezer trucks hold −18°C to −25°C for frozen and deep-freeze cargo. Every trip is logged with continuous temperature monitoring.',10),
  ('Which emirates do you cover?','We operate across all seven emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain — with dedicated local response teams and same-day cross-emirate runs.',20),
  ('Do you offer monthly rental?','Yes. We provide hourly, daily, weekly and monthly rental contracts with dedicated drivers, plus long-term dedicated-vehicle plans for restaurants, supermarkets and pharmaceutical clients.',30),
  ('How fast can you dispatch?','Standard dispatch within 30–60 minutes inside Dubai and Sharjah, 45–90 minutes for Abu Dhabi and 60–120 minutes for the northern emirates. Emergency and pre-booked slots are also available 24/7.',40),
  ('Are your vehicles compliant with UAE regulations?','All vehicles carry Dubai Municipality food-transport permits, follow HACCP-aligned cleaning protocols, and are fitted with calibrated temperature loggers for full traceability.',50),
  ('Can you handle pharmaceutical shipments?','Absolutely. We run GDP-aware routes for pharma, vaccines and clinical samples with pre-cooled vehicles, sealed transfers and temperature reports on delivery.',60),
  ('How do I get a quote?','Send us a WhatsApp message, call +971 50 000 0000, or use our contact form with pickup, drop-off, vehicle type and duration — we reply within minutes.',70);

INSERT INTO public.site_images (key, label, alt) VALUES
  ('home_hero','Homepage hero background','Matla Al Anwar chiller van on Dubai highway'),
  ('cold_chain_interior','Cold-chain van interior','Interior of a temperature-controlled chiller van'),
  ('fleet_lineup','Fleet lineup photo','Matla Al Anwar chiller van fleet lineup');

INSERT INTO public.site_settings (key, value) VALUES
  ('site_tagline','Cold Trust. Safe Delivery.'),
  ('site_phone','+971 50 000 0000'),
  ('site_whatsapp','971500000000'),
  ('site_email','info@matlaalanwar.ae'),
  ('site_address','Dubai, United Arab Emirates'),
  ('meta_home_title','Matla Al Anwar Chiller Van Transport — Cold Chain Logistics UAE'),
  ('meta_home_description','Premium refrigerated van & chiller truck transport across the UAE. Temperature-controlled cold-chain logistics for food, pharma, seafood, flowers and more.');
