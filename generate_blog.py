import os

# 定义文件结构和内容
files = {
    "src/api/supabase.js": """
import { createClient } from '@supabase/supabase-js'

// 替换为你自己的 Supabase 项目配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'public-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// 示例：获取文章列表 API
export const getArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}
""",

    "src/App.vue": """
<template>
  <div class="app-container">
    <header class="header">
      <div class="header-inner container">
        <div class="logo">
          cookiesen<span class="dot">.</span>
        </div>
        <nav class="desktop-nav hidden-xs-only">
          <router-link to="/">首页</router-link>
          <router-link to="/articles">文章</router-link>
          <router-link to="/moments">朋友圈</router-link>
          <a href="https://github.com/cookiesen" target="_blank" class="github-link">
            <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" />
          </a>
        </nav>
        <div class="mobile-menu-btn hidden-sm-and-up" @click="drawer = true">
          <el-icon :size="24"><Menu /></el-icon>
        </div>
      </div>
    </header>

    <el-drawer v-model="drawer" title="导航" direction="rtl" size="60%">
      <nav class="mobile-nav">
        <router-link to="/" @click="drawer = false">首页</router-link>
        <router-link to="/articles" @click="drawer = false">文章</router-link>
        <router-link to="/moments" @click="drawer = false">朋友圈</router-link>
        <a href="https://github.com/cookiesen" target="_blank" class="mobile-github">
          <el-icon><Platform /></el-icon> GitHub
        </a>
      </nav>
    </el-drawer>

    <main class="main-content container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="footer">
      <p>© 2025 cookiesen. Powered by Vue 3 & Supabase.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Menu, Platform } from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/display.css' 

const drawer = ref(false)
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}
.header {
  height: 64px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #eee;
}
.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo { font-size: 22px; font-weight: bold; color: #333; }
.dot { color: #409EFF; }
.desktop-nav a {
  margin-left: 25px;
  text-decoration: none;
  color: #555;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}
.desktop-nav a:hover, .router-link-active { color: #409EFF; }
.github-link img { width: 24px; height: 24px; border-radius: 50%; }
.mobile-nav { display: flex; flex-direction: column; gap: 20px; font-size: 18px; }
.mobile-nav a { text-decoration: none; color: #333; }
.mobile-github { display: flex; align-items: center; gap: 8px; color: #333; }
.main-content { padding-top: 40px; min-height: 80vh; }
.footer { text-align: center; padding: 40px 0; color: #999; font-size: 13px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
""",

    "src/views/Home.vue": """
<template>
  <div class="home">
    <div class="hero-section">
      <el-avatar :size="100" src="https://picsum.photos/id/1005/200/200" />
      <h1>Hi, I'm cookiesen 👋</h1>
      <p class="bio">全栈开发者 / Java & Vue 爱好者 / 记录生活</p>
      <div class="social-links">
        <a href="https://github.com/cookiesen" target="_blank" class="gh-btn">
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
        <el-card shadow="hover" class="mini-card" v-for="i in 2" :key="i">
          <p>正在搭建这个基于 Supabase 的博客，感觉 Serverless 真的很方便！🚀</p>
          <span class="time">10分钟前</span>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <div class="section-title">
          <h3>Recent Articles</h3>
          <router-link to="/articles">More →</router-link>
        </div>
        <el-card shadow="hover" class="mini-card" v-for="j in 2" :key="j">
          <h4>SpringBoot 3.0 迁移指南</h4>
          <span class="time">2025-12-10</span>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.hero-section {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 16px;
  margin-bottom: 40px;
}
.bio { color: #666; margin: 10px 0 20px; }
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
.gh-btn img { width: 20px; }
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.mini-card { margin-bottom: 15px; border: none; background: #fff; }
.mini-card h4 { margin: 0 0 5px; }
.time { font-size: 12px; color: #999; }
</style>
""",

    "src/views/Articles.vue": """
<template>
  <div class="articles-page">
    <div class="toolbar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索文章标题..."
        prefix-icon="Search"
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
            <span class="date">{{ article.date }}</span>
            <el-tag size="small" effect="plain">{{ article.category }}</el-tag>
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
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const sortOrder = ref('desc') 

const articles = ref([
  { id: 1, title: '深入理解 Vue3 Composition API', summary: '本文详细介绍了 setup 语法糖的使用...', date: '2025-12-01', category: 'Frontend' },
  { id: 2, title: 'Supabase 实战：30分钟搭建后端', summary: '无需后端代码，直接使用 PostgreSQL...', date: '2025-11-20', category: 'Backend' },
  { id: 3, title: '我的 2025 年度总结', summary: '这一年我学会了...', date: '2025-12-12', category: 'Life' },
])

const filteredArticles = computed(() => {
  let result = articles.value.filter(item => 
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  return result.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB
  })
})

const goToDetail = (id) => {
  // router.push(`/articles/${id}`)
  console.log('Go to detail', id)
}
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}
.search-input { flex: 1; min-width: 200px; }
.article-item {
  margin-bottom: 20px;
  cursor: pointer;
  border-radius: 8px;
  transition: transform 0.2s;
}
.article-item:hover { transform: translateY(-2px); }
.article-meta { display: flex; gap: 10px; font-size: 13px; color: #999; margin-bottom: 8px; }
.title { margin: 0 0 10px 0; font-size: 18px; color: #333; }
.desc { color: #666; font-size: 14px; margin: 0; line-height: 1.5; }
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(20px); }
</style>
""",

    "src/views/Moments.vue": """
<template>
  <div class="moments-page">
    <el-row :gutter="20">
      <el-col 
        v-for="moment in moments" 
        :key="moment.id" 
        :xs="24" :sm="12" :md="8"
        class="grid-item"
      >
        <el-card class="moment-card" :body-style="{ padding: '0px' }">
          <div v-if="moment.images && moment.images.length" class="card-image-box">
             <el-image 
               :src="moment.images[0]" 
               fit="cover" 
               class="cover-image"
               loading="lazy"
             />
             <div class="img-count" v-if="moment.images.length > 1">
               +{{ moment.images.length }}
             </div>
          </div>
          <div class="card-content">
            <p class="text">{{ moment.content }}</p>
            <div class="card-footer">
              <span class="time">{{ moment.time }}</span>
              <div class="actions">
                <el-button link size="small"><el-icon><Star /></el-icon> {{ moment.likes }}</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const moments = ref([
  { 
    id: 1, 
    content: '今天天气真不错，适合写代码！Vue3 + ElementPlus 开发效率太高了。', 
    time: '2小时前', 
    likes: 12,
    images: ['https://picsum.photos/400/300?r=1', 'https://picsum.photos/400/300?r=2']
  },
  { 
    id: 2, 
    content: '周末去爬山了，风景如画。', 
    time: '昨天', 
    likes: 5,
    images: ['https://picsum.photos/400/400?r=3']
  },
  { 
    id: 3, 
    content: '分享一首好听的歌 🎵', 
    time: '3天前', 
    likes: 8,
    images: [] 
  },
  { 
    id: 4, 
    content: 'Supabase 的实时订阅功能太强了，朋友圈即使刷新！', 
    time: '5天前', 
    likes: 20,
    images: ['https://picsum.photos/400/250?r=4']
  }
])
</script>

<style scoped>
.grid-item { margin-bottom: 20px; }
.moment-card {
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.card-image-box {
  position: relative;
  height: 200px;
  overflow: hidden;
}
.cover-image { width: 100%; height: 100%; display: block; }
.img-count {
  position: absolute;
  right: 10px;
  bottom: 10px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}
.card-content { padding: 15px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.text { font-size: 14px; color: #333; line-height: 1.6; margin: 0 0 10px; }
.card-footer { display: flex; justify-content: space-between; align-items: center; color: #999; font-size: 12px; }
</style>
""",

    "src/router/index.js": """
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Articles from '../views/Articles.vue'
import Moments from '../views/Moments.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/articles', component: Articles },
  { path: '/moments', component: Moments }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
"""
}

def create_files():
    for filepath, content in files.items():
        # 获取目录路径
        directory = os.path.dirname(filepath)
        
        # 如果目录不存在，创建目录
        if directory and not os.path.exists(directory):
            os.makedirs(directory)
            print(f"Created directory: {directory}")
            
        # 写入文件
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content.strip())
        print(f"Generated: {filepath}")

if __name__ == "__main__":
    create_files()
    print("\\n✅ All files generated successfully!")
