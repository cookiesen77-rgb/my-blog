-- ==========================================
-- Supabase Storage Buckets 配置
-- ==========================================

-- 创建 blog-images bucket (用于朋友圈动态图片)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- 创建 avatars bucket (用于用户头像)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Storage 访问策略 (RLS Policies)
-- ==========================================

-- blog-images: 允许所有人读取
CREATE POLICY "Public Access for blog-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- blog-images: 允许所有人上传 (开发阶段,生产环境建议加强认证)
CREATE POLICY "Public Upload for blog-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-images');

-- blog-images: 允许所有人更新自己的文件
CREATE POLICY "Public Update for blog-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-images');

-- blog-images: 允许所有人删除 (开发阶段,生产环境建议加强认证)
CREATE POLICY "Public Delete for blog-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-images');

-- avatars: 允许所有人读取
CREATE POLICY "Public Access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- avatars: 允许所有人上传 (开发阶段,生产环境建议加强认证)
CREATE POLICY "Public Upload for avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');

-- avatars: 允许所有人更新
CREATE POLICY "Public Update for avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars');

-- avatars: 允许所有人删除 (开发阶段,生产环境建议加强认证)
CREATE POLICY "Public Delete for avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars');

-- ==========================================
-- 注意事项
-- ==========================================
-- 1. 当前策略允许匿名用户上传/删除文件,适合开发和个人博客
-- 2. 生产环境建议:
--    - 使用 Supabase Auth 进行用户认证
--    - 限制上传文件大小 (在 bucket 设置中配置)
--    - 限制上传文件类型 (在客户端和策略中验证)
--    - 为删除操作添加所有者检查: USING (auth.uid() = owner)
-- 3. 可以在 Supabase Dashboard > Storage 中手动调整 bucket 设置:
--    - File size limit (文件大小限制)
--    - Allowed MIME types (允许的文件类型)
