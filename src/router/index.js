import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Articles from '../views/Articles.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import Moments from '../views/Moments.vue'
import AdminLogin from '../views/admin/Login.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/articles', component: Articles },
  { path: '/articles/:id', component: ArticleDetail },
  { path: '/moments', component: Moments },
  { path: '/admin', component: AdminLogin },
  { path: '/admin/dashboard', component: AdminDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
