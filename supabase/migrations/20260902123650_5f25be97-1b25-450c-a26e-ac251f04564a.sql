DROP POLICY IF EXISTS "Settings owner reads store media" ON storage.objects;

CREATE POLICY "Visitors can read store media"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'store-media');