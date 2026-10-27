-- Fix: the "media" storage bucket referenced by uploadMedia()/adminSignMediaUpload()
-- was never created, so every image upload in the admin panel (Fleet vehicle
-- photos, Site Photos) fails with "Bucket not found". Text-only sections
-- (Services, FAQs, Site Settings) don't touch storage, which is why those
-- appeared to work while uploads did not.

insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

-- Only admins can write to this bucket. Reads are served via short/long-lived
-- signed URLs (see adminSignMediaUpload), which bypass RLS by design, so no
-- public SELECT policy is required.
create policy "Admins can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can read media"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));
