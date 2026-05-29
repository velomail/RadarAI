-- Storage bucket policies for the `resumes` bucket.
-- Manually create the bucket in Supabase Storage UI first (public: OFF, file size limit: 5MB).
-- Then run this migration in the SQL editor.

-- Authed users can upload to resumes/auth/<their-uid>/*
create policy resumes_auth_upload on storage.objects
  for insert
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = 'auth'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy resumes_auth_read on storage.objects
  for select
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = 'auth'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy resumes_auth_delete on storage.objects
  for delete
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = 'auth'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- Anonymous demo uploads land under resumes/demo/<session-uuid>/*
-- Anon role can insert; Next.js server (service_role) cleans up after 24h.
create policy resumes_demo_upload on storage.objects
  for insert
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = 'demo'
  );
