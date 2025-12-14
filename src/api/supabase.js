import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim()

const isPlaceholder = (value) => {
  if (!value) return true
  const v = value.trim()
  return (
    v === 'https://your-project.supabase.co' ||
    v === 'https://xyzcompany.supabase.co' ||
    v === 'your-anon-key' ||
    v === 'public-anon-key'
  )
}

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseKey && !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseKey))
}

export const supabase = isSupabaseConfigured() ? createClient(supabaseUrl, supabaseKey) : null

const notConfigured = () => ({
  data: null,
  error: new Error('Supabase 未配置：请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_KEY（或 VITE_SUPABASE_ANON_KEY）')
})

// ==================== Articles API ====================

export const getArticles = async (options = {}) => {
  if (!supabase) return notConfigured()
  const { sortOrder = 'desc', limit = 50 } = options
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: sortOrder === 'asc' })
    .limit(limit)
  return { data, error }
}

export const getArticleById = async (id) => {
  if (!supabase) return notConfigured()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export const createArticle = async (article) => {
  if (!supabase) return notConfigured()
  const { data, error } = await supabase
    .from('articles')
    .insert([article])
    .select()
  return { data, error }
}

export const updateArticle = async (id, updates) => {
  if (!supabase) return notConfigured()
  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteArticle = async (id) => {
  if (!supabase) return notConfigured()
  const { data, error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)
  return { data, error }
}

export const incrementArticleViews = async (id) => {
  if (!supabase) return notConfigured()
  const { data, error } = await supabase.rpc('increment_views', { article_id: id })
  return { data, error }
}

// ==================== Moments API ====================

export const getMoments = async (options = {}) => {
  if (!supabase) return notConfigured()
  const { sortOrder = 'desc', limit = 50 } = options
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .order('created_at', { ascending: sortOrder === 'asc' })
    .limit(limit)
  return { data, error }
}

export const getMomentById = async (id) => {
  if (!supabase) return notConfigured()
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export const createMoment = async (moment) => {
  if (!supabase) return notConfigured()
  const { data, error } = await supabase
    .from('moments')
    .insert([moment])
    .select()
  return { data, error }
}

export const updateMoment = async (id, updates) => {
  if (!supabase) return notConfigured()
  const { data, error } = await supabase
    .from('moments')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteMoment = async (id) => {
  if (!supabase) return notConfigured()
  const { data, error } = await supabase
    .from('moments')
    .delete()
    .eq('id', id)
  return { data, error }
}

export const likeMoment = async (id) => {
  if (!supabase) return notConfigured()
  const { data, error } = await supabase.rpc('increment_likes', { moment_id: id })
  return { data, error }
}

// ==================== Storage API ====================

export const uploadImage = async (file, bucket = 'blog-images') => {
  if (!supabase) return notConfigured()

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${fileName}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (error) return { data: null, error }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return { data: { path: filePath, url: publicUrl }, error: null }
}

export const deleteImage = async (filePath, bucket = 'blog-images') => {
  if (!supabase) return notConfigured()
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([filePath])
  return { data, error }
}
