-- Create storage bucket for advertisement files
INSERT INTO storage.buckets (id, name, public)
VALUES ('advertisement-files', 'advertisement-files', true);

-- Allow authenticated admins to upload files
CREATE POLICY "Admins can upload advertisement files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'advertisement-files' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow authenticated admins to update files
CREATE POLICY "Admins can update advertisement files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'advertisement-files' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow authenticated admins to delete files
CREATE POLICY "Admins can delete advertisement files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'advertisement-files' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow anyone to view advertisement files (public bucket)
CREATE POLICY "Anyone can view advertisement files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'advertisement-files');