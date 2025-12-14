<template>
  <div class="home">
    <div class="hero-section">
      <div class="avatar-wrapper">
        <el-avatar :size="100" :src="currentAvatar" />
      </div>
      <h1>Hi, I'm {{ siteSettings.nickname }}</h1>
      <p class="bio">{{ siteSettings.bio }}</p>
      <div class="social-links">
        <a :href="siteSettings.github" target="_blank" class="gh-btn">
          <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" /> GitHub
        </a>
      </div>
    </div>

    <el-row :gutter="20" class="content-row">
      <el-col :xs="24" :md="12">
        <div class="section-title">
          <h3>Latest Moments</h3>
          <router-link to="/moments">More →</router-link>
        </div>
        <template v-if="latestMoments.length">
          <el-card shadow="hover" class="mini-card" v-for="moment in latestMoments" :key="moment.id">
            <p>{{ moment.content }}</p>
            <span class="time">{{ formatTime(moment.created_at) }}</span>
          </el-card>
        </template>
        <el-empty v-else description="暂无动态" :image-size="60" />
      </el-col>
      <el-col :xs="24" :md="12">
        <div class="section-title">
          <h3>Recent Articles</h3>
          <router-link to="/articles">More →</router-link>
        </div>
        <template v-if="latestArticles.length">
          <el-card 
            shadow="hover" 
            class="mini-card clickable" 
            v-for="article in latestArticles" 
            :key="article.id"
            @click="goToArticle(article.id)"
          >
            <h4>{{ article.title }}</h4>
            <span class="time">{{ formatDate(article.created_at) }}</span>
          </el-card>
        </template>
        <el-empty v-else description="暂无文章" :image-size="60" />
      </el-col>
    </el-row>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { formatTime, mockArticles, mockMoments } from '@/api/mock'
import { getArticles, getMoments, isSupabaseConfigured, getSiteSettings } from '@/api/supabase'

const router = useRouter()
const articles = ref([])
const moments = ref([])

const siteSettings = reactive({
  avatar: '/avatar.png',
  nickname: 'cookiesen',
  bio: '全栈开发者 / Java & Vue 爱好者 / 记录生活',
  github: 'https://github.com/cookiesen77-rgb'
})

// 头像（只读，通过后台管理修改）
const currentAvatar = ref('/avatar.png')

const latestArticles = computed(() => {
  return [...articles.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 2)
})

const latestMoments = computed(() => {
  return [...moments.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 2)
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const goToArticle = (id) => {
  router.push(`/articles/${id}`)
}

const loadContent = async () => {
  if (!isSupabaseConfigured()) {
    articles.value = mockArticles
    moments.value = mockMoments
    return
  }

  const [{ data: articlesData, error: articlesError }, { data: momentsData, error: momentsError }] =
    await Promise.all([getArticles({ limit: 50 }), getMoments({ limit: 50 })])

  if (articlesError) {
    ElMessage.error('获取文章列表失败')
    articles.value = []
  } else {
    articles.value = articlesData || []
  }

  if (momentsError) {
    ElMessage.error('获取朋友圈失败')
    moments.value = []
  } else {
    moments.value = momentsData || []
  }
}

onMounted(async () => {
  loadContent()
  
  // 从数据库读取站点设置
  if (isSupabaseConfigured()) {
    const { data, error } = await getSiteSettings()
    if (!error && data) {
      siteSettings.avatar = data.avatar || '/avatar.png'
      siteSettings.nickname = data.nickname || 'cookiesen'
      siteSettings.bio = data.bio || '全栈开发者 / AI爱好者 / 记录生活'
      siteSettings.github = data.github || 'https://github.com/cookiesen77-rgb'
      currentAvatar.value = siteSettings.avatar
      return
    }
  }
  
  // 降级：从 localStorage 读取
  const saved = JSON.parse(localStorage.getItem('blogSettings') || '{}')
  siteSettings.avatar = saved.avatar || '/avatar.png'
  siteSettings.nickname = saved.nickname || 'cookiesen'
  siteSettings.bio = saved.bio || '全栈开发者 / AI爱好者 / 记录生活'
  siteSettings.github = saved.github || 'https://github.com/cookiesen77-rgb'
  currentAvatar.value = siteSettings.avatar
})
</script>

<style scoped>
.hero-section {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 16px;
  margin-bottom: 40px;
}

.avatar-wrapper {
  display: inline-block;
}

.bio { 
  color: #666; 
  margin: 10px 0 20px; 
}

.gh-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #24292e;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
}

.gh-btn img { 
  width: 20px; 
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title a {
  color: #409eff;
  font-size: 14px;
}

.mini-card { 
  margin-bottom: 15px; 
  border: none; 
  background: #fff;
  border-radius: 8px;
}

.mini-card.clickable {
  cursor: pointer;
  transition: transform 0.2s;
}

.mini-card.clickable:hover {
  transform: translateY(-2px);
}

.mini-card h4 { 
  margin: 0 0 5px;
  font-size: 15px;
  color: #333;
}

.mini-card p {
  margin: 0 0 8px;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.time { 
  font-size: 12px; 
  color: #999; 
}

@media (max-width: 768px) {
  .hero-section {
    padding: 30px 15px;
  }

  .content-row .el-col:first-child {
    margin-bottom: 20px;
  }
}
</style>
