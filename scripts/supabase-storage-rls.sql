-- ============================================================
-- Supabase Storage RLS Policies for MP Production
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────
-- mp-public: anyone reads, authenticated uploads
-- ──────────────────────────────────────────────

CREATE POLICY "public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'mp-public');

CREATE POLICY "auth_upload_public" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'mp-public'
    AND auth.role() = 'authenticated'
  );

-- ──────────────────────────────────────────────
-- mp-private: only owner or admin can read/write
-- ──────────────────────────────────────────────

CREATE POLICY "private_owner_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'mp-private' AND (
      auth.uid()::text = (storage.foldername(name))[2]
      OR auth.jwt()->>'role' IN ('admin','super_admin')
    )
  );

CREATE POLICY "private_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'mp-private'
    AND auth.role() = 'authenticated'
  );

-- ──────────────────────────────────────────────
-- mp-cms: public reads, only admin uploads
-- ──────────────────────────────────────────────

CREATE POLICY "cms_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'mp-cms');

CREATE POLICY "cms_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'mp-cms' AND
    auth.jwt()->>'role' IN ('admin','super_admin')
  );
