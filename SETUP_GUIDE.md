# 🚀 Supabase 配置完整指南

本指南将帮助你快速配置 Supabase，启用图片上传功能。

---

## ⚠️ 当前状态

检测到你的 Supabase 配置可能不正确：

```
VITE_SUPABASE_URL=https://gqvzempovmyfzqmyvojn.supabase.co
VITE_SUPABASE_KEY=sbp_2140... ❌ 无效的 Key
```

**错误**: `Invalid Compact JWS` - 说明 API Key 格式不正确

---

## 📋 配置步骤

### 步骤 1: 获取正确的 Supabase Keys

#### 1.1 打开 Supabase Dashboard

访问: https://gqvzempovmyfzqmyvojn.supabase.co/project/_/settings/api

#### 1.2 复制 API Keys

在 **Project API keys** 部分，你会看到两个 keys:

| Key 类型 | 用途 | 是否公开 |
|---------|------|---------|
| **anon public** | 前端使用，可以公开 | ✅ 安全 |
| **service_role** | 后端/管理使用，保密 | ⚠️ 不可泄露 |

**复制 `anon public` key**，它看起来像这样：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...（很长）
```

### 步骤 2: 更新 .env 文件

编辑 `/Users/mac/Desktop/blog/.env`:

```bash
VITE_SUPABASE_URL=https://gqvzempovmyfzqmyvojn.supabase.co
VITE_SUPABASE_KEY=你的_anon_public_key_在这里
```

> ⚠️ 注意: 替换整个 key，确保没有多余的空格

### 步骤 3: 执行数据库脚本

#### 3.1 打开 SQL Editor

访问: https://gqvzempovmyfzqmyvojn.supabase.co/project/_/sql

#### 3.2 执行 schema.sql (如果还没执行)

1. 点击 **New Query**
2. 复制 `supabase/schema.sql` 的全部内容
3. 粘贴到编辑器
4. 点击 **Run** 执行

**预期结果**:
- ✅ Success: CREATE TABLE (2个表)
- ✅ Success: CREATE FUNCTION (2个函数)
- ✅ Success: CREATE POLICY (多个策略)

#### 3.3 执行 storage.sql (创建 Storage Buckets)

1. 点击 **New Query** (新建查询)
2. 复制 `supabase/storage.sql` 的全部内容
3. 粘贴到编辑器
4. 点击 **Run** 执行

**预期结果**:
- ✅ Success: INSERT INTO storage.buckets (2行)
- ✅ Success: CREATE POLICY (8个策略)

### 步骤 4: 验证 Storage Buckets

#### 4.1 检查 Buckets

访问: https://gqvzempovmyfzqmyvojn.supabase.co/project/_/storage/buckets

你应该看到两个 buckets:

| Bucket 名称 | 状态 | 用途 |
|------------|------|------|
| `blog-images` | 🌍 Public | 朋友圈动态图片 |
| `avatars` | 🌍 Public | 用户头像 |

#### 4.2 配置 Bucket 限制 (推荐)

点击每个 bucket 的设置图标，配置：

**blog-images**:
- File size limit: `5 MB`
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

**avatars**:
- File size limit: `1 MB`
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

### 步骤 5: 测试配置

#### 5.1 本地测试

```bash
# 重启开发服务器（如果正在运行）
npm run dev
```

打开 http://localhost:5173

#### 5.2 测试图片上传

1. 访问后台管理: http://localhost:5173/admin
2. 登录（密码: `admin123`）
3. 点击 **朋友圈管理** > **发布动态**
4. 点击图片上传按钮 (+)
5. 选择一张图片上传
6. 点击 **发布**

**预期结果**:
- ✅ 图片成功上传到 Supabase Storage
- ✅ 动态发布成功，图片正常显示

#### 5.3 检查 Storage 中的文件

返回: https://gqvzempovmyfzqmyvojn.supabase.co/project/_/storage/buckets/blog-images

你应该看到刚才上传的图片！

### 步骤 6: 部署到生产环境

#### 6.1 配置 Vercel 环境变量

1. 访问: https://vercel.com/cookiesens-projects/blog/settings/environment-variables
2. 添加两个环境变量:

```
VITE_SUPABASE_URL = https://gqvzempovmyfzqmyvojn.supabase.co
VITE_SUPABASE_KEY = 你的_anon_public_key_在这里
```

3. 选择应用到 **Production, Preview, Development**
4. 点击 **Save**

#### 6.2 重新部署

```bash
npm run build
npx vercel --prod
```

或者在 Vercel Dashboard 中点击 **Redeploy**

---

## ✅ 完成检查清单

- [ ] 获取了正确的 Supabase anon key
- [ ] 更新了 .env 文件
- [ ] 执行了 schema.sql
- [ ] 执行了 storage.sql
- [ ] 看到了 blog-images 和 avatars 两个 buckets
- [ ] 本地测试图片上传成功
- [ ] 配置了 Vercel 环境变量
- [ ] 重新部署到生产环境
- [ ] 生产环境测试图片上传成功

---

## 🛠️ 常见问题

### Q1: "Invalid Compact JWS" 错误

**原因**: Supabase Key 格式不正确

**解决**:
1. 确保复制的是完整的 anon key
2. key 应该是一个很长的字符串，以 `eyJ` 开头
3. 不要有多余的空格或换行

### Q2: 图片上传失败 "bucket does not exist"

**原因**: Storage buckets 未创建

**解决**: 执行 `supabase/storage.sql`

### Q3: 图片上传失败 "new row violates row-level security policy"

**原因**: RLS 策略未正确设置

**解决**:
1. 检查 storage.sql 是否执行成功
2. 在 Supabase Dashboard > Storage > Policies 中确认策略存在

### Q4: 本地可以，生产环境不行

**原因**: Vercel 环境变量未配置

**解决**: 在 Vercel 设置中添加环境变量，然后重新部署

---

## 📞 获取帮助

如果遇到问题:

1. 检查 Supabase Dashboard 中的 Logs
2. 检查浏览器控制台的错误信息
3. 运行配置检查脚本: `npm run setup:storage`

---

## 🎉 配置成功！

配置完成后，你的博客将支持：
- ✅ 后台管理发布动态时上传图片
- ✅ 后台管理个人设置中上传头像
- ✅ 前端首页点击头像编辑上传
- ✅ 图片存储在 Supabase Cloud
- ✅ 全球 CDN 加速访问

享受你的博客吧！ 🚀
