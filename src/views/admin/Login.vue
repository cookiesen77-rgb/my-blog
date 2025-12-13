<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2>后台管理</h2>
      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入管理密码"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <p class="hint">默认密码: admin123</p>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const form = ref({
  password: ''
})

const ADMIN_PASSWORD = localStorage.getItem('adminPassword') || 'admin123'

const handleLogin = () => {
  if (!form.value.password) {
    ElMessage.warning('请输入密码')
    return
  }
  
  loading.value = true
  setTimeout(() => {
    if (form.value.password === ADMIN_PASSWORD) {
      localStorage.setItem('isAdminLoggedIn', 'true')
      ElMessage.success('登录成功')
      router.push('/admin/dashboard')
    } else {
      ElMessage.error('密码错误')
    }
    loading.value = false
  }, 500)
}
</script>

<style scoped>
.login-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 360px;
  padding: 20px;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.hint {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}
</style>
