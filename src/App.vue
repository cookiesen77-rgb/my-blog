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
          <a :href="siteConfig.github" target="_blank" class="github-link">
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
        <a :href="siteConfig.github" target="_blank" class="mobile-github">
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
import { siteConfig } from '@/config/site'
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