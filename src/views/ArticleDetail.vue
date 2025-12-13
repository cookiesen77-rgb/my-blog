<template>
  <div class="article-detail">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else-if="article">
      <div class="article-header">
        <el-button link @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon> 返回列表
        </el-button>
        <h1 class="title">{{ article.title }}</h1>
        <div class="meta">
          <span class="date">{{ formatDate(article.created_at) }}</span>
          <el-tag size="small" effect="plain">{{ article.category }}</el-tag>
          <span class="views"><el-icon><View /></el-icon> {{ article.views }}</span>
        </div>
      </div>

      <el-card class="article-content" shadow="never">
        <div class="markdown-body" v-html="renderedContent"></div>
      </el-card>
    </template>

    <el-empty v-else description="文章不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { ElMessage } from 'element-plus'
import { mockArticles } from '@/api/mock'
import { getArticleById, incrementArticleViews, isSupabaseConfigured } from '@/api/supabase'

const route = useRoute()
const router = useRouter()
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

const article = ref(null)
const loading = ref(true)

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  return md.render(article.value.content)
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goBack = () => {
  router.push('/articles')
}

const fetchArticle = async () => {
  loading.value = true
  const id = Number(route.params.id)

  if (!Number.isFinite(id)) {
    article.value = null
    loading.value = false
    return
  }

  if (!isSupabaseConfigured()) {
    article.value = mockArticles.find((a) => a.id === id) || null
    loading.value = false
    return
  }

  const { data, error } = await getArticleById(id)
  if (error) {
    ElMessage.error('获取文章失败')
    article.value = null
    loading.value = false
    return
  }

  article.value = data || null
  loading.value = false

  // best-effort：浏览量 +1（需要数据库中存在对应 RPC / RLS 配置）
  incrementArticleViews(id).catch(() => {})
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  padding: 20px;
}

.back-btn {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.article-header {
  margin-bottom: 30px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px;
  line-height: 1.4;
}

.meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #999;
  font-size: 14px;
}

.views {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-content {
  border-radius: 12px;
  border: none;
}

.markdown-body {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #333;
}

.markdown-body :deep(h1) { font-size: 24px; }
.markdown-body :deep(h2) { font-size: 20px; }
.markdown-body :deep(h3) { font-size: 18px; }

.markdown-body :deep(p) {
  margin-bottom: 16px;
}

.markdown-body :deep(code) {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
}

.markdown-body :deep(pre) {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 16px;
  margin: 16px 0;
  color: #666;
  font-style: italic;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.markdown-body :deep(li) {
  margin-bottom: 8px;
}

.markdown-body :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .title {
    font-size: 22px;
  }
  
  .markdown-body {
    font-size: 15px;
  }
}
</style>
