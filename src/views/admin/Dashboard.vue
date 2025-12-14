<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <h1>后台管理</h1>
      <el-button type="danger" link @click="handleLogout">退出登录</el-button>
    </div>

    <el-tabs v-model="activeTab" class="admin-tabs">
      <el-tab-pane label="文章管理" name="articles">
        <div class="tab-header">
          <el-button type="primary" @click="openArticleDialog()">
            <el-icon><Plus /></el-icon> 发布文章
          </el-button>
        </div>
        <el-table :data="articles" stripe>
          <el-table-column prop="title" label="标题" min-width="200" />
          <el-table-column prop="category" label="分类" width="100" />
          <el-table-column label="发布时间" width="180">
            <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row, $index }">
              <el-button link type="primary" @click="openArticleDialog(row, $index)">编辑</el-button>
              <el-button link type="danger" @click="deleteArticle($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!articles.length" description="暂无文章" />
      </el-tab-pane>

      <el-tab-pane label="朋友圈管理" name="moments">
        <div class="tab-header">
          <el-button type="primary" @click="openMomentDialog()">
            <el-icon><Plus /></el-icon> 发布动态
          </el-button>
        </div>
        <el-table :data="moments" stripe>
          <el-table-column label="内容" min-width="300">
            <template #default="{ row }">
              <span>{{ row.content.length > 50 ? row.content.slice(0, 50) + '...' : row.content }}</span>
            </template>
          </el-table-column>
          <el-table-column label="图片" width="100">
            <template #default="{ row }">{{ row.images ? row.images.length : 0 }} 张</template>
          </el-table-column>
          <el-table-column label="发布时间" width="180">
            <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ $index }">
              <el-button link type="danger" @click="deleteMoment($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!moments.length" description="暂无动态" />
      </el-tab-pane>

      <el-tab-pane label="个人设置" name="settings">
        <el-form :model="settings" label-width="100px" class="settings-form">
          <el-form-item label="头像">
            <div class="avatar-setting">
              <el-avatar :size="80" :src="settings.avatar" />
              <div style="margin-left: 15px; flex: 1;">
                <el-input v-model="settings.avatar" placeholder="头像图片 URL" />
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleAvatarUpload"
                  accept="image/*"
                  style="margin-top: 10px;"
                >
                  <el-button size="small">
                    <el-icon><Plus /></el-icon> 本地上传
                  </el-button>
                </el-upload>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="settings.nickname" placeholder="你的昵称" />
          </el-form-item>
          <el-form-item label="个人简介">
            <el-input v-model="settings.bio" type="textarea" :rows="2" placeholder="一句话介绍自己" />
          </el-form-item>
          <el-form-item label="GitHub">
            <el-input v-model="settings.github" placeholder="GitHub 主页链接" />
          </el-form-item>
          <el-form-item label="管理密码">
            <el-input v-model="settings.password" type="password" show-password placeholder="留空则不修改" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveSettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="articleDialogVisible" :title="articleIsEdit ? '编辑文章' : '发布文章'" width="700px">
      <el-form :model="articleForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="articleForm.title" placeholder="文章标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="articleForm.category" placeholder="选择分类" allow-create filterable>
            <el-option label="Frontend" value="Frontend" />
            <el-option label="Backend" value="Backend" />
            <el-option label="Life" value="Life" />
            <el-option label="Tech" value="Tech" />
          </el-select>
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="articleForm.summary" type="textarea" :rows="2" placeholder="文章摘要" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="articleForm.content" type="textarea" :rows="12" placeholder="支持 Markdown 格式" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="articleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveArticle">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="momentDialogVisible" title="发布动态" width="600px">
      <el-form :model="momentForm" label-width="80px">
        <el-form-item label="内容">
          <el-input v-model="momentForm.content" type="textarea" :rows="4" placeholder="想法..." />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            class="image-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleImageChange"
            :on-remove="handleImageRemove"
            :file-list="fileList"
            list-type="picture-card"
            accept="image/*"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div style="margin-top: 10px; color: #999; font-size: 12px;">
            支持本地上传或输入图片URL
          </div>
          <el-input
            v-model="momentForm.imageInput"
            placeholder="或输入图片 URL，多张用逗号分隔"
            style="margin-top: 10px;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeMomentDialog">取消</el-button>
        <el-button type="primary" @click="saveMoment" :loading="uploading">
          {{ uploading ? '上传中...' : '发布' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { uploadImage, isSupabaseConfigured } from '@/api/supabase'

const router = useRouter()
const activeTab = ref('articles')
const articles = ref([])
const moments = ref([])

const settings = reactive({
  avatar: '',
  nickname: '',
  bio: '',
  github: '',
  password: ''
})

const articleDialogVisible = ref(false)
const articleIsEdit = ref(false)
const articleEditIndex = ref(-1)
const articleForm = reactive({
  title: '',
  category: 'Frontend',
  summary: '',
  content: ''
})

const momentDialogVisible = ref(false)
const momentForm = reactive({
  content: '',
  imageInput: ''
})
const fileList = ref([])
const uploading = ref(false)

const momentImages = computed(() => {
  if (momentForm.imageInput) {
    return momentForm.imageInput.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
})

const formatDate = (dateString) => new Date(dateString).toLocaleString('zh-CN')

const loadData = () => {
  articles.value = JSON.parse(localStorage.getItem('blogArticles') || '[]')
  moments.value = JSON.parse(localStorage.getItem('blogMoments') || '[]')
  const saved = JSON.parse(localStorage.getItem('blogSettings') || '{}')
  settings.avatar = saved.avatar || localStorage.getItem('userAvatar') || '/avatar.png'
  settings.nickname = saved.nickname || 'cookiesen'
  settings.bio = saved.bio || '全栈开发者 / Java & Vue 爱好者 / 记录生活'
  settings.github = saved.github || 'https://github.com/cookiesen77-rgb'
}

const saveData = () => {
  localStorage.setItem('blogArticles', JSON.stringify(articles.value))
  localStorage.setItem('blogMoments', JSON.stringify(moments.value))
}

const openArticleDialog = (article = null, index = -1) => {
  articleIsEdit.value = !!article
  articleEditIndex.value = index
  if (article) {
    Object.assign(articleForm, article)
  } else {
    articleForm.title = ''
    articleForm.category = 'Frontend'
    articleForm.summary = ''
    articleForm.content = ''
  }
  articleDialogVisible.value = true
}

const saveArticle = () => {
  if (!articleForm.title || !articleForm.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }
  if (articleIsEdit.value) {
    const old = articles.value[articleEditIndex.value]
    articles.value[articleEditIndex.value] = { ...articleForm, id: old.id, created_at: old.created_at, views: old.views }
    ElMessage.success('文章已更新')
  } else {
    articles.value.unshift({ ...articleForm, id: Date.now(), created_at: new Date().toISOString(), views: 0 })
    ElMessage.success('文章已发布')
  }
  saveData()
  articleDialogVisible.value = false
}

const deleteArticle = (index) => {
  ElMessageBox.confirm('确定删除这篇文章吗？', '提示', { type: 'warning' }).then(() => {
    articles.value.splice(index, 1)
    saveData()
    ElMessage.success('已删除')
  }).catch(() => {})
}

const openMomentDialog = () => {
  momentForm.content = ''
  momentForm.imageInput = ''
  fileList.value = []
  momentDialogVisible.value = true
}

const closeMomentDialog = () => {
  momentForm.content = ''
  momentForm.imageInput = ''
  fileList.value = []
  momentDialogVisible.value = false
}

const handleImageChange = (file) => {
  fileList.value.push(file)
}

const handleImageRemove = (file) => {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

const saveMoment = async () => {
  if (!momentForm.content) {
    ElMessage.warning('请填写内容')
    return
  }

  uploading.value = true
  const imageUrls = [...momentImages.value]

  try {
    if (fileList.value.length > 0 && isSupabaseConfigured()) {
      for (const file of fileList.value) {
        const { data, error } = await uploadImage(file.raw)
        if (error) {
          ElMessage.error(`图片上传失败: ${error.message}`)
          uploading.value = false
          return
        }
        if (data && data.url) {
          imageUrls.push(data.url)
        }
      }
    } else if (fileList.value.length > 0 && !isSupabaseConfigured()) {
      for (const file of fileList.value) {
        const reader = new FileReader()
        const base64 = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result)
          reader.readAsDataURL(file.raw)
        })
        imageUrls.push(base64)
      }
    }

    moments.value.unshift({
      id: Date.now(),
      content: momentForm.content,
      images: imageUrls,
      likes: 0,
      created_at: new Date().toISOString()
    })
    saveData()
    ElMessage.success('动态已发布')
    closeMomentDialog()
  } catch (error) {
    ElMessage.error('发布失败，请重试')
    console.error(error)
  } finally {
    uploading.value = false
  }
}

const deleteMoment = (index) => {
  ElMessageBox.confirm('确定删除这条动态吗？', '提示', { type: 'warning' }).then(() => {
    moments.value.splice(index, 1)
    saveData()
    ElMessage.success('已删除')
  }).catch(() => {})
}

const handleAvatarUpload = async (file) => {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await uploadImage(file.raw, 'avatars')
      if (error) {
        ElMessage.error(`上传失败: ${error.message}`)
        return
      }
      if (data && data.url) {
        settings.avatar = data.url
        ElMessage.success('头像上传成功')
      }
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        settings.avatar = e.target.result
        ElMessage.success('头像已设置（使用base64��')
      }
      reader.readAsDataURL(file.raw)
    }
  } catch (error) {
    ElMessage.error('上传失败，请重试')
    console.error(error)
  }
}

const saveSettings = () => {
  localStorage.setItem('blogSettings', JSON.stringify({ avatar: settings.avatar, nickname: settings.nickname, bio: settings.bio, github: settings.github }))
  localStorage.setItem('userAvatar', settings.avatar)
  if (settings.password) {
    localStorage.setItem('adminPassword', settings.password)
    ElMessage.success('设置已保存，密码已更新')
  } else {
    ElMessage.success('设置已保存')
  }
}

const handleLogout = () => {
  localStorage.removeItem('isAdminLoggedIn')
  router.push('/admin')
}

onMounted(() => {
  if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
    router.push('/admin')
    return
  }
  loadData()
})
</script>

<style scoped>
.admin-dashboard { max-width: 1000px; margin: 0 auto; }
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.admin-header h1 { font-size: 24px; color: #333; }
.admin-tabs { background: #fff; padding: 20px; border-radius: 8px; }
.tab-header { margin-bottom: 20px; }
.settings-form { max-width: 600px; }
.avatar-setting { display: flex; align-items: center; }
.image-preview { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.preview-img { width: 60px; height: 60px; border-radius: 4px; }

/* 图片上传样式 */
.image-uploader :deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}
.image-uploader :deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}
</style>
