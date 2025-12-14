#!/usr/bin/env node

/**
 * Supabase Storage Buckets 自动配置脚本
 *
 * 功能：
 * 1. 验证 Supabase 连接
 * 2. 检查现有 buckets
 * 3. 创建缺失的 buckets (需要 service_role key)
 * 4. 提供手动配置指导
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 读取 .env 文件
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) {
    return {}
  }

  const envContent = fs.readFileSync(envPath, 'utf-8')
  const env = {}

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return

    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim()
    }
  })

  return env
}

const env = loadEnv()

// 读取环境变量
const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_KEY
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const REQUIRED_BUCKETS = [
  { name: 'blog-images', public: true },
  { name: 'avatars', public: true }
]

console.log('\n🚀 Supabase Storage 配置工具\n')
console.log('=' .repeat(50))

// 验证环境变量
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ 错误: 缺少必要的环境变量')
  console.log('\n请确保 .env 文件包含:')
  console.log('  VITE_SUPABASE_URL=your-project-url')
  console.log('  VITE_SUPABASE_KEY=your-anon-key')
  console.log('\n可选 (用于自动创建 buckets):')
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  process.exit(1)
}

console.log(`\n✅ Supabase URL: ${SUPABASE_URL}`)
console.log(`✅ Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`)

// 创建客户端 (使用 service_role key 如果可用，否则使用 anon key)
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, supabaseKey)

async function checkBuckets() {
  console.log('\n📦 检查现有 Storage Buckets...\n')

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('❌ 无法列出 buckets:', error.message)
      return null
    }

    console.log(`找到 ${buckets.length} 个 bucket(s):`)
    buckets.forEach(bucket => {
      const status = bucket.public ? '🌍 Public' : '🔒 Private'
      console.log(`  - ${bucket.name} ${status}`)
    })

    return buckets
  } catch (err) {
    console.error('❌ 检查失败:', err.message)
    return null
  }
}

async function createBucket(bucketName, isPublic = true) {
  console.log(`\n📝 尝试创建 bucket: ${bucketName}`)

  try {
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic,
      fileSizeLimit: bucketName === 'avatars' ? 1048576 : 5242880, // 1MB for avatars, 5MB for blog-images
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`  ⚠️  Bucket "${bucketName}" 已存在`)
        return true
      }
      console.error(`  ❌ 创建失败: ${error.message}`)
      return false
    }

    console.log(`  ✅ 成功创建 bucket: ${bucketName}`)
    return true
  } catch (err) {
    console.error(`  ❌ 创建失败: ${err.message}`)
    return false
  }
}

async function createBuckets() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.log('\n⚠️  警告: 未提供 SUPABASE_SERVICE_ROLE_KEY')
    console.log('无法自动创建 buckets。将跳过自动创建步骤。\n')
    return false
  }

  console.log('\n🔨 开始创建 buckets...')

  let allSuccess = true
  for (const bucket of REQUIRED_BUCKETS) {
    const success = await createBucket(bucket.name, bucket.public)
    if (!success) allSuccess = false
  }

  return allSuccess
}

function printManualInstructions() {
  console.log('\n' + '='.repeat(50))
  console.log('\n📖 手动配置指南\n')

  console.log('如果自动创建失败，请按以下步骤手动配置:\n')

  console.log('1️⃣  打开 Supabase Dashboard:')
  console.log(`   ${SUPABASE_URL.replace('.supabase.co', '.supabase.co/project/_/settings/api')}\n`)

  console.log('2️⃣  获取 Service Role Key:')
  console.log('   - 在 Settings > API 页面')
  console.log('   - 复制 "service_role" key (⚠️ 保密!)\n')

  console.log('3️⃣  执行 SQL 脚本:')
  console.log('   - 打开 SQL Editor: ' + SUPABASE_URL.replace('.supabase.co', '.supabase.co/project/_/sql'))
  console.log('   - 点击 "New Query"')
  console.log('   - 复制粘贴 supabase/storage.sql 的内容')
  console.log('   - 点击 "Run" 执行\n')

  console.log('4️⃣  验证创建成功:')
  console.log('   - 打开 Storage: ' + SUPABASE_URL.replace('.supabase.co', '.supabase.co/project/_/storage/buckets'))
  console.log('   - 确认看到 "blog-images" 和 "avatars" 两个 buckets')
  console.log('   - 确认都标记为 "Public"\n')

  console.log('5️⃣  测试上传功能:')
  console.log('   - 访问后台管理: https://cookiesen-blog.vercel.app/admin')
  console.log('   - 登录后尝试发布动态并上传图片\n')

  const sqlPath = path.join(__dirname, '..', 'supabase', 'storage.sql')
  if (fs.existsSync(sqlPath)) {
    console.log('📄 SQL 脚本位置:')
    console.log(`   ${sqlPath}\n`)
  }

  console.log('=' .repeat(50) + '\n')
}

async function main() {
  // 检查现有 buckets
  const existingBuckets = await checkBuckets()

  if (!existingBuckets) {
    console.log('\n⚠️  无法访问 Storage API')
    printManualInstructions()
    return
  }

  // 检查哪些 buckets 缺失
  const existingNames = existingBuckets.map(b => b.name)
  const missingBuckets = REQUIRED_BUCKETS.filter(
    b => !existingNames.includes(b.name)
  )

  if (missingBuckets.length === 0) {
    console.log('\n✅ 所有必需的 buckets 已存在!')
    console.log('\n配置完成! 可以开始使用图片上传功能了。\n')
    return
  }

  console.log(`\n⚠️  缺少 ${missingBuckets.length} 个 bucket(s):`)
  missingBuckets.forEach(b => console.log(`  - ${b.name}`))

  // 尝试自动创建
  const success = await createBuckets()

  // 无论成功与否，都检查最终状态
  console.log('\n🔍 最终检查...')
  await checkBuckets()

  // 如果有失败或没有 service_role key，显示手动指南
  if (!success || !SUPABASE_SERVICE_ROLE_KEY) {
    printManualInstructions()
  } else {
    console.log('\n✅ 配置完成! 所有 buckets 已创建。\n')
  }
}

main().catch(err => {
  console.error('\n❌ 脚本执行失败:', err)
  process.exit(1)
})
