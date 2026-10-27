-- Fix: an earlier migration revoked EXECUTE on has_role() from anon/authenticated,
-- but the "Public can read published posts" RLS policy on blog_posts calls
-- public.has_role(auth.uid(), 'admin') in its USING clause for those same roles.
-- Without EXECUTE, every SELECT against blog_posts (including the public blog
-- list/detail pages) fails with "permission denied for function has_role".
-- Re-grant EXECUTE so the policy can evaluate; the function itself only returns
-- a boolean and does not expose any data beyond role membership.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
