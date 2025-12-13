<template>
  <div class="articles-page">
    <div class="toolbar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索文章标题..."
        :prefix-icon="Search"
        clearable
        class="search-input"
      />
      <el-button-group class="sort-btn">
        <el-button 
          :type="sortOrder === 'desc' ? 'primary' : 'default'" 
          @click="sortOrder = 'desc'">
          最新
        </el-button>
        <el-button 
          :type="sortOrder === 'asc' ? 'primary' : 'default'" 
          @click="sortOrder = 'asc'">
          最早
        </el-button>
      </el-button-group>
    </div>

    <div class="article-list">
      <transition-group name="list">
        <el-card 
          v-for="article in filteredArticles" 
          :key="article.id" 
          class="article-item" 
          shadow="hover"
          @click="goToDetail(article.id)"
        >
          <div class="article-meta">
            <span class="date">{{ formatDate(article.created_at) }}</span>
            <el-tag size="small" effect="plain">{{ article.category }}</el-tag>
            <span class="views"><el-icon><View /></el-icon> {{ article.views }}</span>
          </div>
          <h2 class="title">{{ article.title }}</h2>
          <p class="desc">{{ article.summary }}</p>
        </el-card>
      </transition-group>
      <el-empty v-if="filteredArticles.length === 0" description="没有找到相关文章" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { mockArticles } from '@/api/mock'
import { getArticles, isSupabaseConfigured } from '@/api/supabase'

const router = useRouter()
const searchQuery = ref('')
const sortOrder = ref('desc')
const articles = ref([])

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const filteredArticles = computed(() => {
  let result = articles.value.filter(item => 
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  return result.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB
  })
})

const goToDetail = (id) => {
  router.push(`/articles/${id}`)
}

const loadArticles = async () => {
  if (!isSupabaseConfigured()) {
    articles.value = mockArticles
    return
  }

  const { data, error } = await getArticles({ limit: 200 })
  if (error) {
    ElMessage.error('获取文章列表失败')
    articles.value = []
    return
  }
  articles.value = data || []
}

onMounted(loadArticles)
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.search-input { 
  flex: 1; 
  min-width: 200px; 
}

.article-item {
  margin-bottom: 20px;
  cursor: pointer;
  border-radius: 8px;
  transition: transform 0.2s;
  border: none;
}

.article-item:hover { 
  transform: translateY(-2px); 
}

.article-meta { 
  display: flex; 
  gap: 10px; 
  font-size: 13px; 
  color: #999; 
  margin-bottom: 8px;
  align-items: center;
}

.views {
  display: flex;
  align-items: center;
  gap: 4px;
}

.title { 
  margin: 0 0 10px 0; 
  font-size: 18px; 
  color: #333; 
}

.desc { 
  color: #666; 
  font-size: 14px; 
  margin: 0; 
  line-height: 1.5; 
}

.list-enter-active, .list-leave-active { 
  transition: all 0.4s ease; 
}

.list-enter-from, .list-leave-to { 
  opacity: 0; 
  transform: translateY(20px); 
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 10px;
  }

  .search-input {
    width: 100%;
  }

  .title {
    font-size: 16px;
  }
}
</style>
