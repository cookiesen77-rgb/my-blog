<template>
  <div class="moments-page">
    <div class="moments-list">
      <div 
        v-for="moment in moments" 
        :key="moment.id" 
        class="moment-item"
      >
        <!-- 头像和昵称 -->
        <div class="moment-header">
          <el-avatar :size="44" :src="userAvatar" class="avatar" />
          <div class="header-info">
            <span class="nickname">{{ userNickname }}</span>
            <span class="time">{{ formatTime(moment.created_at) }}</span>
          </div>
        </div>

        <!-- 内容 -->
        <div class="moment-body">
          <p class="content">{{ moment.content }}</p>
          
          <!-- 图片网格 -->
          <div 
            v-if="getImages(moment).length" 
            class="image-grid"
            :class="getImageGridClass(getImages(moment).length)"
          >
            <el-image 
              v-for="(img, idx) in getImages(moment)"
              :key="idx"
              :src="img" 
              fit="cover" 
              class="grid-image"
              loading="lazy"
              :preview-src-list="getImages(moment)"
              :initial-index="idx"
              preview-teleported
            />
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="moment-footer">
          <button 
            class="like-btn"
            :class="{ liked: isLiked(moment.id) }"
            @click="handleLike(moment)"
            :disabled="isLiked(moment.id)"
          >
            <svg v-if="isLiked(moment.id)" class="icon-heart filled" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <svg v-else class="icon-heart" viewBox="0 0 24 24">
              <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
            </svg>
            <span class="like-count">{{ moment.likes || 0 }}</span>
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="!moments.length" description="暂无动态" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { formatTime, mockMoments } from '@/api/mock'
import { getMoments, isSupabaseConfigured, likeMoment, getSiteSettings } from '@/api/supabase'

const moments = ref([])
const userAvatar = ref('/avatar.png')
const userNickname = ref('cookiesen')

// 获取已点赞列表
const getLikedMoments = () => {
  try {
    return JSON.parse(localStorage.getItem('likedMoments') || '[]')
  } catch {
    return []
  }
}

// 保存已点赞列表
const saveLikedMoments = (list) => {
  localStorage.setItem('likedMoments', JSON.stringify(list))
}

// 检查是否已点赞
const isLiked = (momentId) => {
  return getLikedMoments().includes(momentId)
}

const getImages = (moment) => {
  return Array.isArray(moment?.images) ? moment.images : []
}

const getImageGridClass = (count) => {
  if (count === 1) return 'grid-1'
  if (count === 2) return 'grid-2'
  if (count === 3) return 'grid-3'
  if (count === 4) return 'grid-4'
  if (count >= 5 && count <= 6) return 'grid-6'
  return 'grid-9'
}

const handleLike = async (moment) => {
  // 检查是否已点赞
  if (isLiked(moment.id)) {
    ElMessage.warning('你已经点过赞了')
    return
  }

  // 乐观更新 UI
  moment.likes = (moment.likes || 0) + 1
  
  // 保存点赞状态到本地
  const likedList = getLikedMoments()
  likedList.push(moment.id)
  saveLikedMoments(likedList)

  // 同步到数据库
  if (isSupabaseConfigured()) {
    const { error } = await likeMoment(moment.id)
    if (error) {
      // 回滚
      moment.likes = Math.max((moment.likes || 1) - 1, 0)
      const idx = likedList.indexOf(moment.id)
      if (idx > -1) likedList.splice(idx, 1)
      saveLikedMoments(likedList)
      ElMessage.error('点赞失败')
    }
  }
}

const loadMoments = async () => {
  if (!isSupabaseConfigured()) {
    moments.value = mockMoments
    return
  }

  // 并行加载设置和动态
  const [settingsRes, momentsRes] = await Promise.all([
    getSiteSettings(),
    getMoments({ limit: 200 })
  ])

  // 加载用户设置
  if (!settingsRes.error && settingsRes.data) {
    userAvatar.value = settingsRes.data.avatar || '/avatar.png'
    userNickname.value = settingsRes.data.nickname || 'cookiesen'
  }

  // 加载动态
  if (momentsRes.error) {
    ElMessage.error('获取朋友圈失败')
    moments.value = []
    return
  }
  moments.value = momentsRes.data || []
}

onMounted(loadMoments)
</script>

<style scoped>
.moments-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 15px 30px;
}

.moments-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.moment-item {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.moment-item:last-child {
  border-bottom: none;
}

/* 头部 */
.moment-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar {
  flex-shrink: 0;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nickname {
  font-weight: 600;
  color: #576b95;
  font-size: 15px;
}

.time {
  font-size: 12px;
  color: #999;
}

/* 内容 */
.moment-body {
  padding-left: 56px;
}

.content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin: 0 0 12px;
  word-break: break-word;
  white-space: pre-wrap;
}

/* 图片网格 */
.image-grid {
  display: grid;
  gap: 4px;
  max-width: 100%;
}

.image-grid.grid-1 {
  grid-template-columns: 1fr;
  max-width: 280px;
}

.image-grid.grid-1 .grid-image {
  aspect-ratio: 4/3;
  max-height: 200px;
}

.image-grid.grid-2 {
  grid-template-columns: repeat(2, 1fr);
  max-width: 280px;
}

.image-grid.grid-2 .grid-image {
  aspect-ratio: 1;
}

.image-grid.grid-3 {
  grid-template-columns: repeat(3, 1fr);
  max-width: 300px;
}

.image-grid.grid-3 .grid-image {
  aspect-ratio: 1;
}

.image-grid.grid-4 {
  grid-template-columns: repeat(2, 1fr);
  max-width: 200px;
}

.image-grid.grid-4 .grid-image {
  aspect-ratio: 1;
}

.image-grid.grid-6 {
  grid-template-columns: repeat(3, 1fr);
  max-width: 300px;
}

.image-grid.grid-6 .grid-image {
  aspect-ratio: 1;
}

.image-grid.grid-9 {
  grid-template-columns: repeat(3, 1fr);
  max-width: 300px;
}

.image-grid.grid-9 .grid-image {
  aspect-ratio: 1;
}

.grid-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  background: #f5f5f5;
}

/* 底部操作栏 */
.moment-footer {
  padding-left: 56px;
  margin-top: 10px;
}

.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  background: #f7f7f7;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #666;
}

.like-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.like-btn:disabled {
  cursor: default;
}

.like-btn.liked {
  color: #ff6b6b;
  background: #fff0f0;
}

.icon-heart {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.icon-heart.filled {
  fill: #ff6b6b;
}

.like-count {
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 768px) {
  .moments-page {
    padding: 0 10px 20px;
  }

  .moment-item {
    padding: 15px 0;
  }

  .moment-body {
    padding-left: 0;
    margin-top: 10px;
  }

  .moment-footer {
    padding-left: 0;
  }

  .avatar {
    width: 40px !important;
    height: 40px !important;
  }

  .content {
    font-size: 14px;
  }

  .image-grid.grid-1,
  .image-grid.grid-2,
  .image-grid.grid-3,
  .image-grid.grid-4,
  .image-grid.grid-6,
  .image-grid.grid-9 {
    max-width: 100%;
  }
}
</style>
