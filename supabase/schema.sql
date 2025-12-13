-- Cookiesen Blog Database Schema
-- Run this SQL in Supabase SQL Editor

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  views INTEGER DEFAULT 0
);

-- Moments Table
CREATE TABLE IF NOT EXISTS moments (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to increment article views
CREATE OR REPLACE FUNCTION increment_views(article_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE articles SET views = views + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment moment likes
CREATE OR REPLACE FUNCTION increment_likes(moment_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE moments SET likes = likes + 1 WHERE id = moment_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (optional, for public read access)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on articles" ON articles
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on moments" ON moments
  FOR SELECT USING (true);

-- Sample Data (optional)
INSERT INTO articles (title, summary, content, category, views) VALUES
('深入理解 Vue3 Composition API', '本文详细介绍了 Vue3 Composition API 的核心概念', '# Vue3 Composition API\n\n...', 'Frontend', 128),
('Supabase 实战：30分钟搭建后端', '无需后端代码，直接使用 PostgreSQL', '# Supabase 实战\n\n...', 'Backend', 256);

INSERT INTO moments (content, images, likes) VALUES
('今天天气真不错，适合写代码！', ARRAY['https://picsum.photos/400/300'], 12),
('周末去爬山了，风景如画。', ARRAY['https://picsum.photos/400/400'], 25);
