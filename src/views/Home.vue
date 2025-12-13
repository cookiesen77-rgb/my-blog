<template>
  <div class="home">
    <div class="hero-section">
      <div class="avatar-wrapper" @click="showAvatarDialog = true">
        <el-avatar :size="100" :src="currentAvatar" />
        <div class="avatar-edit-hint">
          <el-icon><Edit /></el-icon>
        </div>
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

    <!-- 头像更换弹窗 -->
    <el-dialog v-model="showAvatarDialog" title="更换头像" width="400px">
      <el-form label-position="top">
        <el-form-item label="头像 URL">
          <el-input v-model="newAvatarUrl" placeholder="输入图片链接" clearable />
        </el-form-item>
        <el-form-item label="或上传本地图片">
          <el-upload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            accept="image/*"
          >
            <el-button type="primary">选择图片</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="预览">
          <el-avatar :size="80" :src="previewAvatar || currentAvatar" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAvatarDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAvatar">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { formatTime, mockArticles, mockMoments } from '@/api/mock'
import { getArticles, getMoments, isSupabaseConfigured } from '@/api/supabase'

const router = useRouter()
const articles = ref([])
const moments = ref([])

const siteSettings = reactive({
  avatar: '/avatar.png',
  nickname: 'cookiesen',
  bio: '全栈开发者 / Java & Vue 爱好者 / 记录生活',
  github: 'https://github.com/cookiesen77-rgb'
})

// 头像相关
const showAvatarDialog = ref(false)
const newAvatarUrl = ref('')
const previewAvatar = ref('')
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

const handleAvatarChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    previewAvatar.value = e.target.result
    newAvatarUrl.value = ''
  }
  reader.readAsDataURL(file.raw)
}

const saveAvatar = () => {
  const avatar = newAvatarUrl.value || previewAvatar.value
  if (avatar) {
    currentAvatar.value = avatar
    localStorage.setItem('userAvatar', avatar)
  }
  showAvatarDialog.value = false
  newAvatarUrl.value = ''
  previewAvatar.value = ''
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

onMounted(() => {
  loadContent()
  
  // 读取个人设置
  const saved = JSON.parse(localStorage.getItem('blogSettings') || '{}')
  siteSettings.avatar = saved.avatar || localStorage.getItem('userAvatar') || '/avatar.png'
  siteSettings.nickname = saved.nickname || 'cookiesen'
  siteSettings.bio = saved.bio || '全栈开发者 / Java & Vue 爱好者 / 记录生活'
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
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.avatar-edit-hint {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-wrapper:hover .avatar-edit-hint {
  opacity: 1;
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

.avatar-uploader {
  display: inline-block;
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
