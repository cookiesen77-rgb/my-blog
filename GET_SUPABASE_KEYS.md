# 🔑 获取正确的 Supabase Keys

## ⚠️ 当前问题

检测到你的 `.env` 文件中的 key 格式不正确：

```bash
# ❌ 错误的格式
VITE_SUPABASE_KEY=sbp_21404d3f0604e14667c1374560863c7232a84497
```

这是一个 **Personal Access Token** (用于 CLI/API)，不是用于前端的 **Anon Key**。

---

## ✅ 正确的配置方式

### 步骤 1: 打开 Supabase Dashboard

访问你的项目设置页面：

**直接链接**: https://gqvzempovmyfzqmyvojn.supabase.co/project/_/settings/api

或者：
1. 访问 https://supabase.com/dashboard
2. 选择你的项目 (`gqvzempovmyfzqmyvojn`)
3. 点击左侧菜单 **Settings** (齿轮图标)
4. 点击 **API**

### 步骤 2: 找到正确的 Keys

在 **Project API keys** 部分，你会看到两种 keys：

#### A. **anon public** (用于前端) ✅ 推荐

- **用途**: 浏览器端、移动端应用
- **特征**: 长字符串，以 `eyJ` 开头
- **示例**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...`
- **安全**: 可以公开，受 RLS 保护

**这就是你需要的 key!**

#### B. **service_role** (用于服务端) ⚠️ 保密

- **用途**: 服务端、管理操作
- **特征**: 长字符串，以 `eyJ` 开头
- **权限**: 绕过所有 RLS 策略
- **安全**: 绝对不能泄露

### 步骤 3: 复制 Keys

1. 找到 **anon public** key
2. 点击复制图标（或手动选择全部复制）
3. 确保复制完整（约 200+ 字符）

### 步骤 4: 更新 .env 文件

编辑 `/Users/mac/Desktop/blog/.env`:

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://gqvzempovmyfzqmyvojn.supabase.co
VITE_SUPABASE_KEY=你刚复制的完整anon_key

# ⚠️ anon key 示例（不要使用这个，用你自己的）:
# VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdnplbXBvdm15Znpxbonvm2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAwMDAwMDAsImV4cCI6MTk5NTU3NjAwMH0...
```

---

## 📝 两种 Key 的区别

| 属性 | anon public | service_role |
|------|-------------|--------------|
| 用途 | 前端/客户端 | 后端/管理 |
| 安全等级 | 可公开 | 绝密 |
| RLS 保护 | 受限制 | 完全访问 |
| 存储位置 | .env, 代码 | 仅服务器 |
| 起始字符 | eyJ... | eyJ... |

---

## 🔐 Personal Access Token (当前在用的)

你现在使用的 `sbp_xxx` 格式的 token 是 **Personal Access Token**：

- **用途**: Supabase CLI, Management API, MCP 服务器
- **不适用**: 浏览器端 JavaScript SDK
- **获取方式**: Account Settings > Access Tokens

---

## ⚡ 快速修复步骤

### 1️⃣ 获取 anon key

```bash
# 打开浏览器
open https://gqvzempovmyfzqmyvojn.supabase.co/project/_/settings/api

# 复制 "anon public" key
```

### 2️⃣ 更新 .env

```bash
# 编辑文件
nano .env

# 替换 VITE_SUPABASE_KEY 的值为刚复制的 anon key
```

### 3️⃣ 重新运行脚本

```bash
npm run create:buckets
```

---

## 🎯 验证配置是否正确

运行以下命令检查：

```bash
# 检查 key 格式
cat .env | grep VITE_SUPABASE_KEY

# 正确示例 (应该看到):
# VITE_SUPABASE_KEY=eyJhbGciOi...（很长的字符串）

# 错误示例 (不应该是):
# VITE_SUPABASE_KEY=sbp_xxx...
```

---

## 💡 关于 MCP 配置

在 `.mcp.json` 中，**可以**使用 Personal Access Token (sbp_xxx)：

```json
{
  "supabase": {
    "command": "npx",
    "args": [
      "-y",
      "@supabase/mcp-server-supabase@latest",
      "--access-token",
      "sbp_21404d3f0604e14667c1374560863c7232a84497"
    ]
  }
}
```

但在 `.env` 中用于前端应用的必须是 anon key：

```bash
VITE_SUPABASE_KEY=eyJhbGciOi...（anon key）
```

---

## 🚨 常见错误

### ❌ "Invalid Compact JWS"

**原因**: 使用了 Personal Access Token 而不是 anon key

**解决**: 使用 anon public key

### ❌ "Invalid API key"

**原因**: key 不完整或有误

**解决**: 重新复制完整的 key

### ❌ Key 太短

**原因**: 只复制了部分 key

**解决**: anon key 通常超过 200 个字符

---

## 📞 获取帮助

如果仍然有问题：

1. 检查项目引用是否正确: `gqvzempovmyfzqmyvojn`
2. 确认 key 以 `eyJ` 开头
3. 确认 key 长度超过 200 字符
4. 重新生成 keys (Settings > API > Reset)

---

## ✅ 配置成功的标志

当配置正确后：

```bash
$ npm run create:buckets

🚀 Supabase Storage Buckets 创建工具
============================================================
✅ Project: gqvzempovmyfzqmyvojn
✅ URL: https://gqvzempovmyfzqmyvojn.supabase.co

📦 检查现有 Storage Buckets...
找到 0 个现有 bucket(s):

🔨 开始创建 buckets...
📝 创建 bucket: blog-images
  ✅ 成功创建 bucket: blog-images
```

现在去获取正确的 anon key，然后我们就能创建 buckets 了！🚀
