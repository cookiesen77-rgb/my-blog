# 🚀 快速开始 - Supabase 配置

## 当前状态检测

❌ **配置未完成** - 需要获取正确的 Supabase anon key

---

## 🎯 一分钟快速配置

### 1. 获取 Supabase Anon Key（1分钟）

**直接访问**: https://gqvzempovmyfzqmyvojn.supabase.co/project/_/settings/api

找到 **anon public** 部分，复制完整的 key（以 `eyJ` 开头）

### 2. 更新 .env 文件

```bash
VITE_SUPABASE_URL=https://gqvzempovmyfzqmyvojn.supabase.co
VITE_SUPABASE_KEY=你刚复制的完整anon_key
```

### 3. 创建 Storage Buckets

```bash
npm run create:buckets
```

### 4. 执行 SQL 创建策略

访问: https://gqvzempovmyfzqmyvojn.supabase.co/project/_/sql

复制粘贴 `supabase/storage.sql` 的内容，点击 Run

### 5. 测试

```bash
npm run dev
# 访问 http://localhost:5173/admin
# 登录后测试图片上传
```

---

## 📚 详细文档

| 文档 | 用途 |
|------|------|
| `GET_SUPABASE_KEYS.md` | 📖 如何获取正确的 Keys |
| `SETUP_GUIDE.md` | 📋 完整配置指南 |
| `MCP_GUIDE.md` | 🔧 MCP 使用指南 |
| `supabase/README.md` | 💾 数据库配置说明 |

---

## 🔧 可用命令

```bash
# 开发服务器
npm run dev

# 创建 Storage Buckets
npm run create:buckets

# 检查 Supabase 配置
npm run setup:storage

# 构建生产版本
npm run build

# 部署到 Vercel
npm run build && npx vercel --prod
```

---

## ✅ 检查清单

- [ ] 获取正确的 anon key (以 eyJ 开头)
- [ ] 更新 .env 文件
- [ ] 运行 `npm run create:buckets`
- [ ] 执行 `supabase/storage.sql`
- [ ] 验证 buckets 已创建
- [ ] 本地测试图片上传
- [ ] 配置 Vercel 环境变量
- [ ] 部署到生产环境

---

## ⚡ 问题排查

**问题**: "Invalid Compact JWS"
**解决**: 使用 anon key，不是 access token (sbp_xxx)

**问题**: Buckets 创建失败
**解决**: 检查 anon key 是否正确复制

**问题**: 图片上传失败
**解决**: 执行 storage.sql 创建 RLS 策略

---

## 🎉 配置成功后

你的博客将支持：
- ✅ 后台上传图片到朋友圈
- ✅ 后台上传头像
- ✅ 前端编辑头像
- ✅ 云端存储 (Supabase Storage)
- ✅ 全球 CDN 加速

开始吧！第一步：[获取 Supabase Keys](GET_SUPABASE_KEYS.md)
