# Cookiesen 个人博客系统（Vue3 + Supabase）项目总结与后续计划

本文用于记录当前代码现状、Supabase 云数据库接入方式、以及 EdgeOne Pages 部署与后续待办事项。

> 注意：不要把任何 `access token / api token / anon key` 直接写入仓库文件或聊天记录。建议统一使用本地 `.env` 或运行环境变量注入。

## 1. 当前项目结构

- 前端：Vue 3 + Vite + Vue Router 4 + Element Plus + SCSS
- 数据层：
  - `src/api/supabase.js`：Supabase CRUD/RPC 封装（支持未配置时“安全降级”）
  - `src/api/mock.js`：高质量 Mock 数据（用于演示/兜底）
- 页面：
  - `src/views/Home.vue`：Hero + 最新文章/动态概览
  - `src/views/Articles.vue`：文章列表（搜索/排序）
  - `src/views/ArticleDetail.vue`：文章详情（Markdown 渲染）
  - `src/views/Moments.vue`：朋友圈/碎碎念（图片网格 + 点赞）
- 数据库 schema：
  - `supabase/schema.sql`：`articles`/`moments` 两表 + `increment_views`/`increment_likes` RPC + RLS/Policy 示例

## 2. 已完成的关键改造

### 2.1 Supabase 接入策略（真库优先，未配置回退 Mock）

已将视图层数据源切换为：

1) 如果 Supabase 已正确配置：从 Supabase 读取数据
2) 如果 Supabase 未配置：自动回退到 `src/api/mock.js`，保证页面可演示不白屏

涉及文件：

- `src/api/supabase.js`：新增 `isSupabaseConfigured()`，并在未配置时避免创建 client
- `src/views/Home.vue`、`src/views/Articles.vue`、`src/views/ArticleDetail.vue`、`src/views/Moments.vue`：读取 Supabase；失败/未配置回退 Mock

### 2.2 图片上传功能（本地上传 + Supabase Storage）

新增完整的图片上传功能，支持：

**后台管理 (`src/views/admin/Dashboard.vue`)**:
- ✅ 发布动态时可本地上传图片（多图支持）
- ✅ 个人设置中可本地上传头像
- ✅ 支持 Supabase Storage 云存储
- ✅ 未配置 Supabase 时使用 Base64 本地存储

**前端页面 (`src/views/Home.vue`)**:
- ✅ 首页头像可点击编辑
- ✅ 支持 URL 输入或本地上传
- ✅ 实时预览功能

**Storage API (`src/api/supabase.js`)**:
- `uploadImage(file, bucket)`: 上传图片到指定 bucket
- `deleteImage(filePath, bucket)`: 删除指定图片
- 自动生成唯一文件名，返回公开访问 URL

**配置文件**:
- `supabase/storage.sql`: Storage buckets 和 RLS 策略
- `supabase/README.md`: 完整的 Supabase 配置指南

### 2.3 Moments 移动端图片网格稳定性

`src/views/Moments.vue`：将图片布局改为 `grid-auto-rows` 驱动的网格高度策略，降低 `<768px` 下图片"塌陷/错位"的概率。

## 3. 本地开发与环境变量

### 3.1 本地开发

```bash
npm install
npm run dev
```

### 3.2 必要环境变量（本地 `.env`，不要提交）

在项目根目录创建 `.env`：

```bash
VITE_SUPABASE_URL=你的_supabase_project_url
VITE_SUPABASE_KEY=你的_supabase_anon_key
# 或者：
# VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

示例见：`.env.example`

## 4. Supabase 数据库准备（建表/RLS/RPC/Storage）

详细配置指南请参考 `supabase/README.md`。

### 步骤 1: 执行数据库脚本

将 `supabase/schema.sql` 粘贴到 Supabase 控制台的 SQL Editor 执行。

**表结构**:
- `articles`: 文章表 (id, title, summary, content, category, created_at, views)
- `moments`: 朋友圈表 (id, content, images[], likes, created_at)

**RPC 函数**:
- `increment_views(article_id bigint)` - 增加文章浏览量
- `increment_likes(moment_id bigint)` - 增加动态点赞数

### 步骤 2: 创建 Storage Buckets

将 `supabase/storage.sql` 粘贴到 SQL Editor 执行。

**Buckets**:
- `blog-images`: 存储朋友圈动态图片
- `avatars`: 存储用户头像

**访问策略**:
- ✅ 公开读取（所有人可查看图片）
- ✅ 公开上传（开发环境，适合个人博客）
- ⚠️ 生产环境建议启用认证限制

### 步骤 3: 验证配置

在 Supabase Dashboard 中检查：
1. **Database** > Tables: 确认 `articles` 和 `moments` 表存在
2. **Storage**: 确认 `blog-images` 和 `avatars` buckets 存在且为 Public
3. **SQL Editor**: 测试 RPC 函数

> 完整配置指南请查看 `supabase/README.md`

## 5. EdgeOne Pages 部署（静态站）

当前构建产物目录：`dist/`（`npm run build` 生成）

一般流程：

```bash
npm run build
```

然后把 `dist/` 目录部署到 EdgeOne Pages。

> 若使用 MCP 自动部署：需要先在 Codex/Cursor 等工具的 MCP 配置中正确注入 `EDGEONE_PAGES_API_TOKEN`（不要写进仓库）。

## 6. 近期待办（Action Plan）

### P0（必须）

- ✅ ~~用 Supabase MCP/控制台确认 `articles`/`moments` 表、RLS、Policy、RPC 已正确生效~~
- ✅ **数据库表已创建**（通过 MCP 自动完成 2024-12-14）:
  - `articles` 表（3条示例文章）
  - `moments` 表（4条示例动态）
  - `increment_views` / `increment_likes` RPC 函数
  - 完整的 RLS 策略（SELECT/INSERT/UPDATE/DELETE）
  - 修复了 search_path 安全警告
- ✅ **Supabase Storage Buckets 已创建**:
  - `blog-images` bucket（朋友圈图片）
  - `avatars` bucket（用户头像）
  - 公开读取和上传权限已配置
- ⚠️ 配置生产环境的 `VITE_SUPABASE_URL`/`VITE_SUPABASE_KEY`（需在 Vercel Dashboard 手动配置）
- ✅ ~~确认 Vercel 部署成功~~ (已部署: https://blog-six-lake-83.vercel.app 和 https://cookiesen-blog.vercel.app)

### P1（强烈建议）

- **Storage 安全加固**（新增）:
  - 在 Supabase Storage Bucket Settings 中限制文件大小（推荐: 图片 5MB, 头像 1MB）
  - 限制允许的 MIME 类型为 `image/jpeg, image/png, image/webp, image/gif`
  - 生产环境启用 Supabase Auth，限制上传权限为已认证用户
  - 添加客户端文件大小和类型验证
- 鉴权与写操作：
  - 点赞（`increment_likes`）与浏览量（`increment_views`）的权限策略完善
  - 生产环境建议引入 Supabase Auth 或服务端代理，避免滥用
- 数据加载体验：
  - 列表页加 loading / error / empty 状态统一��件
  - 文章/动态分页或无限滚动

### P2（优化）

- 组件按需引入（当前是整包 Element Plus 引入，后续可用自动导入插件减少体积）
- **图片优化**:
  - ✅ ~~Moments 图片迁移到 Supabase Storage~~ (已完成)
  - 添加图片压缩功能（上传前客户端压缩）
  - 图片懒加载优化
  - 支持 WebP 格式
  - CDN 加速配置
- SEO 与分享：
  - `title/meta` 动态设置，文章详情支持 OG 标签（如需 SSR 可考虑 Nuxt）

## 7. 安全提示（重要）

- 不要在任何文件里提交：
  - Supabase `access token`
  - Supabase `service_role key`
  - EdgeOne `api token`
- 如曾在终端/日志/聊天里暴露过 token，建议立刻在对应平台轮换/作废并重新生成。

