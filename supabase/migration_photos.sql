-- Migración: Agregar campo photo_url a posts y configurar Storage
-- Ejecutar este archivo en el SQL Editor de Supabase

-- 1. Agregar columna photo_url a la tabla posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Crear el bucket de storage para fotos de posts (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-photos', 'post-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas para el bucket de fotos de posts
-- Cualquiera puede ver las fotos (bucket público)
DROP POLICY IF EXISTS "Public read access for post photos" ON storage.objects;
CREATE POLICY "Public read access for post photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-photos');

-- Usuarios autenticados pueden subir fotos
DROP POLICY IF EXISTS "Authenticated users can upload post photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload post photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-photos');

-- Usuarios pueden eliminar sus propias fotos
DROP POLICY IF EXISTS "Users can delete own post photos" ON storage.objects;
CREATE POLICY "Users can delete own post photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Usuarios pueden actualizar sus propias fotos
DROP POLICY IF EXISTS "Users can update own post photos" ON storage.objects;
CREATE POLICY "Users can update own post photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'post-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
