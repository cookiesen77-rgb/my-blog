#!/usr/bin/env node

/**
 * Supabase 配置验证脚本
 * 验证 Storage buckets 和上传功能
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return {}

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

console.log('\n🔍 Supabase 配置验证工具\n')
console.log('='.repeat(60))

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('\n❌ 缺少环境变量')
  process.exit(1)
}

console.log(`\n✅ URL: ${SUPABASE_URL}`)
console.log(`✅ Key: ${SUPABASE_KEY.substring(0, 30)}...`)

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function verifyBuckets() {
  console.log('\n📦 检查 Storage Buckets...\n')

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('❌ 无法访问 Storage:', error.message)
      return false
    }

    const requiredBuckets = ['blog-images', 'avatars']
    const existingNames = buckets.map(b => b.name)

    console.log(`找到 ${buckets.length} 个 bucket(s):\n`)

    let allFound = true
    requiredBuckets.forEach(name => {
      const bucket = buckets.find(b => b.name === name)
      if (bucket) {
        const status = bucket.public ? '🌍 Public' : '🔒 Private'
        console.log(`  ✅ ${name} ${status}`)
      } else {
        console.log(`  ❌ ${name} (缺失)`)
        allFound = false
      }
    })

    return allFound
  } catch (err) {
    console.error('❌ 检查失败:', err.message)
    return false
  }
}

async function testUpload() {
  console.log('\n📤 测试图片上传...\n')

  try {
    // 创建一个测试图片 (1x1 透明PNG)
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    const fileName = `test-${Date.now()}.png`

    console.log(`  上传测试文件: ${fileName}`)

    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, testImage, {
        contentType: 'image/png'
      })

    if (error) {
      console.error(`  ❌ 上传失败: ${error.message}`)
      return false
    }

    console.log(`  ✅ 上传成功: ${data.path}`)

    // 获取公开URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName)

    console.log(`  🌍 公开URL: ${publicUrl}`)

    // 清理测试文件
    console.log(`  🧹 清理测试文件...`)
    const { error: deleteError } = await supabase.storage
      .from('blog-images')
      .remove([fileName])

    if (deleteError) {
      console.log(`  ⚠️  清理失败: ${deleteError.message}`)
    } else {
      console.log(`  ✅ 测试文件已删除`)
    }

    return true
  } catch (err) {
    console.error('❌ 测试失败:', err.message)
    return false
  }
}

async function checkDatabase() {
  console.log('\n🗄️  检查数据库表...\n')

  try {
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('count')
      .limit(1)

    if (articlesError) {
      console.log(`  ⚠️  articles 表: ${articlesError.message}`)
    } else {
      console.log(`  ✅ articles 表存在`)
    }

    const { data: moments, error: momentsError } = await supabase
      .from('moments')
      .select('count')
      .limit(1)

    if (momentsError) {
      console.log(`  ⚠️  moments 表: ${momentsError.message}`)
    } else {
      console.log(`  ✅ moments 表存在`)
    }

    return true
  } catch (err) {
    console.error('❌ 检查失败:', err.message)
    return false
  }
}

async function main() {
  try {
    // 1. 验证 buckets
    const bucketsOk = await verifyBuckets()

    // 2. 测试上传
    const uploadOk = await testUpload()

    // 3. 检查数据库
    await checkDatabase()

    // 总结
    console.log('\n' + '='.repeat(60))
    console.log('\n📊 验证结果\n')

    if (bucketsOk && uploadOk) {
      console.log('✅ 所有检查通过！')
      console.log('\n🎉 Supabase Storage 配置成功！')
      console.log('\n下一步:')
      console.log('  1. 运行 npm run dev')
      console.log('  2. 访问 http://localhost:5173/admin')
      console.log('  3. 登录后测试图片上传功能')
      console.log('\n')
      process.exit(0)
    } else {
      console.log('⚠️  部分检查未通过')
      console.log('\n请检查:')
      if (!bucketsOk) console.log('  - Storage buckets 配置')
      if (!uploadOk) console.log('  - RLS 策略设置')
      console.log('\n')
      process.exit(1)
    }

  } catch (error) {
    console.error('\n❌ 验证失败:', error.message)
    process.exit(1)
  }
}

main()
