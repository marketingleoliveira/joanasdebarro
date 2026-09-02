CREATE POLICY "Settings owner reads store media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'store-media'
  AND public.can_manage_settings()
);

CREATE POLICY "Settings owner uploads store media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'store-media'
  AND public.can_manage_settings()
  AND (storage.foldername(name))[1] IN ('logo', 'carousel')
  AND lower(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'webp')
);

CREATE POLICY "Settings owner updates store media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'store-media'
  AND public.can_manage_settings()
)
WITH CHECK (
  bucket_id = 'store-media'
  AND public.can_manage_settings()
  AND (storage.foldername(name))[1] IN ('logo', 'carousel')
  AND lower(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'webp')
);

CREATE POLICY "Settings owner deletes store media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'store-media'
  AND public.can_manage_settings()
);