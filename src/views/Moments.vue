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
          <div v-if="getImages(moment).length" class="card-image-box">
            <div 
              class="image-grid" 
              :class="getImageGridClass(getImages(moment).length)"
            >
              <el-image 
                v-for="(img, idx) in getDisplayImages(getImages(moment))"
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
            <div class="img-count" v-if="getImages(moment).length > 4">
              +{{ getImages(moment).length - 4 }}
            </div>
          </div>
          <div class="card-content">
            <p class="text">{{ moment.content }}</p>
            <div class="card-footer">
              <span class="time">{{ formatTime(moment.created_at) }}</span>
              <div class="actions">
                <el-button link size="small" @click="handleLike(moment)">
                  <el-icon><Star /></el-icon> {{ moment.likes }}
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { formatTime, mockMoments } from '@/api/mock'
import { getMoments, isSupabaseConfigured, likeMoment } from '@/api/supabase'

const moments = ref([])

const getImages = (moment) => {
  return Array.isArray(moment?.images) ? moment.images : []
}

const getImageGridClass = (count) => {
  if (count === 1) return 'grid-1'
  if (count === 2) return 'grid-2'
  if (count === 3) return 'grid-3'
  return 'grid-4'
}

const getDisplayImages = (images) => {
  return images.slice(0, 4)
}

const handleLike = async (moment) => {
  moment.likes = (moment.likes || 0) + 1

  if (!isSupabaseConfigured()) return

  const { error } = await likeMoment(moment.id)
  if (error) {
    moment.likes = Math.max((moment.likes || 1) - 1, 0)
    ElMessage.error('点赞失败')
  }
}

const loadMoments = async () => {
  if (!isSupabaseConfigured()) {
    moments.value = mockMoments
    return
  }

  const { data, error } = await getMoments({ limit: 200 })
  if (error) {
    ElMessage.error('获取朋友圈失败')
    moments.value = []
    return
  }
  moments.value = data || []
}

onMounted(loadMoments)
</script>

<style scoped>
.moments-page {
  padding-bottom: 20px;
}

.grid-item { 
  margin-bottom: 20px; 
}

.moment-card {
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
}

.card-image-box {
  position: relative;
  overflow: hidden;
}

.image-grid {
  display: grid;
  gap: 4px;
}

.image-grid.grid-1 {
  grid-template-columns: 1fr;
  grid-auto-rows: 200px;
}

.image-grid.grid-2 {
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 150px;
}

.image-grid.grid-3 {
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 100px;
}

.image-grid.grid-3 .grid-image:first-child {
  grid-row: span 2;
}

.image-grid.grid-4 {
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 100px;
}

.grid-image { 
  width: 100%; 
  height: 100%;
  display: block; 
  cursor: pointer;
}

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

.card-content { 
  padding: 15px; 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
}

.text { 
  font-size: 14px; 
  color: #333; 
  line-height: 1.6; 
  margin: 0 0 10px;
  word-break: break-word;
}

.card-footer { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  color: #999; 
  font-size: 12px; 
}

.actions .el-button {
  color: #999;
}

.actions .el-button:hover {
  color: #409eff;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .moments-page {
    padding: 0 5px;
  }

  .grid-item {
    margin-bottom: 15px;
  }

  .moment-card {
    border-radius: 8px;
  }

  .image-grid.grid-1 {
    grid-auto-rows: 180px;
  }

  .image-grid.grid-2 {
    grid-auto-rows: 140px;
  }

  .image-grid.grid-3,
  .image-grid.grid-4 {
    grid-auto-rows: 120px;
  }

  .card-content {
    padding: 12px;
  }

  .text {
    font-size: 14px;
  }
}
</style>
