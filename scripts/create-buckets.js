#!/usr/bin/env node

/**
 * Supabase Storage Buckets 自动创建脚本
 * 使用 Supabase Management API 和 JavaScript SDK
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

const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_KEY
const PROJECT_REF = SUPABASE_URL ? SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)?.[1] : null

console.log('\n🚀 Supabase Storage Buckets 创建工具\n')
console.log('='.repeat(60))

if (!SUPABASE_URL || !SUPABASE_KEY || !PROJECT_REF) {
  console.error('\n❌ 错误: 缺少必要的配置')
  console.log('\n请确保 .env 文件包含:')
  console.log('  VITE_SUPABASE_URL=your-project-url')
  console.log('  VITE_SUPABASE_KEY=your-key')
  process.exit(1)
}

console.log(`\n✅ Project: ${PROJECT_REF}`)
console.log(`✅ URL: ${SUPABASE_URL}`)

// 创建 Supabase 客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const BUCKETS_CONFIG = [
  {
    name: 'blog-images',
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  },
  {
    name: 'avatars',
    public: true,
    fileSizeLimit: 1048576, // 1MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  }
]

async function checkExistingBuckets() {
  console.log('\n📦 检查现有 Storage Buckets...\n')

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('❌ 无法列出 buckets:', error.message)
      return null
    }

    console.log(`找到 ${buckets.length} 个现有 bucket(s):`)
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

async function createBucket(config) {
  const { name, public: isPublic, fileSizeLimit, allowedMimeTypes } = config

  console.log(`\n📝 创建 bucket: ${name}`)
  console.log(`   - Public: ${isPublic}`)
  console.log(`   - 文件大小限制: ${(fileSizeLimit / 1024 / 1024).toFixed(1)}MB`)
  console.log(`   - 允许类型: ${allowedMimeTypes.join(', ')}`)

  try {
    const { data, error } = await supabase.storage.createBucket(name, {
      public: isPublic,
      fileSizeLimit,
      allowedMimeTypes
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`  ⚠️  Bucket "${name}" 已存在`)

        // 尝试更新 bucket 设置
        console.log(`  🔄 尝试更新 bucket 设置...`)
        const { error: updateError } = await supabase.storage.updateBucket(name, {
          public: isPublic,
          fileSizeLimit,
          allowedMimeTypes
        })

        if (updateError) {
          console.log(`  ⚠️  更新失败: ${updateError.message}`)
        } else {
          console.log(`  ✅ Bucket 设置已更新`)
        }

        return true
      }
      console.error(`  ❌ 创建失败: ${error.message}`)
      return false
    }

    console.log(`  ✅ 成功创建 bucket: ${name}`)
    return true
  } catch (err) {
    console.error(`  ❌ 创建失败: ${err.message}`)
    return false
  }
}

async function createStoragePolicies() {
  console.log('\n🔐 创建 Storage RLS 策略...\n')

  const policies = [
    {
      bucket: 'blog-images',
      policy: 'Public Access',
      operation: 'SELECT'
    },
    {
      bucket: 'blog-images',
      policy: 'Public Upload',
      operation: 'INSERT'
    },
    {
      bucket: 'avatars',
      policy: 'Public Access',
      operation: 'SELECT'
    },
    {
      bucket: 'avatars',
      policy: 'Public Upload',
      operation: 'INSERT'
    }
  ]

  console.log('⚠️  注意: RLS 策略需要在 Supabase Dashboard 中手动创建')
  console.log('或通过执行 SQL 脚本: supabase/storage.sql\n')

  policies.forEach(p => {
    console.log(`  - ${p.bucket}: ${p.policy} (${p.operation})`)
  })

  return true
}

async function verifyBuckets() {
  console.log('\n🔍 验证创建结果...\n')

  const { data: buckets, error } = await supabase.storage.listBuckets()

  if (error) {
    console.error('❌ 验证失败:', error.message)
    return false
  }

  const existingNames = buckets.map(b => b.name)
  const missingBuckets = BUCKETS_CONFIG.filter(
    config => !existingNames.includes(config.name)
  )

  if (missingBuckets.length === 0) {
    console.log('✅ 所有必需的 buckets 已创建!\n')

    console.log('📊 Bucket 列表:')
    BUCKETS_CONFIG.forEach(config => {
      const bucket = buckets.find(b => b.name === config.name)
      if (bucket) {
        const status = bucket.public ? '🌍 Public' : '🔒 Private'
        console.log(`  ✅ ${bucket.name} ${status}`)
      }
    })

    return true
  } else {
    console.log('⚠️  以下 buckets 创建失败:')
    missingBuckets.forEach(b => console.log(`  - ${b.name}`))
    return false
  }
}

function printNextSteps() {
  console.log('\n' + '='.repeat(60))
  console.log('\n📖 下一步操作\n')

  console.log('1️⃣  设置 RLS 策略（必须）:')
  console.log('   方法 A: 在 Supabase Dashboard 执行 SQL')
  console.log(`   - 打开: ${SUPABASE_URL.replace('.supabase.co', '.supabase.co/project/_/sql')}`)
  console.log('   - 复制 supabase/storage.sql 内容')
  console.log('   - 执行 SQL\n')

  console.log('   方法 B: 手动在 Storage 页面设置')
  console.log(`   - 打开: ${SUPABASE_URL.replace('.supabase.co', '.supabase.co/project/_/storage/policies')}`)
  console.log('   - 为每个 bucket 创建允许公开访问的策略\n')

  console.log('2️⃣  测试上传功能:')
  console.log('   npm run dev')
  console.log('   访问: http://localhost:5173/admin')
  console.log('   登录后尝试上传图片\n')

  console.log('3️⃣  验证 Storage:')
  console.log(`   打开: ${SUPABASE_URL.replace('.supabase.co', '.supabase.co/project/_/storage/buckets')}`)
  console.log('   检查上传的文件\n')

  console.log('='.repeat(60) + '\n')
}

async function main() {
  try {
    // 1. 检查现有 buckets
    const existingBuckets = await checkExistingBuckets()

    if (!existingBuckets) {
      console.log('\n❌ 无法访问 Storage API')
      console.log('\n可能的原因:')
      console.log('  1. API Key 无效或过期')
      console.log('  2. 项目引用不正确')
      console.log('  3. 网络连接问题\n')
      process.exit(1)
    }

    // 2. 创建缺失的 buckets
    console.log('\n🔨 开始创建 buckets...')

    let allSuccess = true
    for (const config of BUCKETS_CONFIG) {
      const success = await createBucket(config)
      if (!success) allSuccess = false
    }

    // 3. 提示创建 RLS 策略
    await createStoragePolicies()

    // 4. 验证结果
    const verified = await verifyBuckets()

    if (verified) {
      console.log('\n🎉 Buckets 创建成功!\n')
      printNextSteps()
      process.exit(0)
    } else {
      console.log('\n⚠️  部分 buckets 创建失败\n')
      printNextSteps()
      process.exit(1)
    }

  } catch (error) {
    console.error('\n❌ 脚本执行失败:', error.message)
    console.error(error)
    process.exit(1)
  }
}

main()
