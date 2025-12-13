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

### 2.2 Moments 移动端图片网格稳定性

`src/views/Moments.vue`：将图片布局改为 `grid-auto-rows` 驱动的网格高度策略，降低 `<768px` 下图片“塌陷/错位”的概率。

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

## 4. Supabase 数据库准备（建表/RLS/RPC）

将 `supabase/schema.sql` 粘贴到 Supabase 控制台的 SQL Editor 执行，或用 MCP/CLI 方式应用迁移（推荐迁移方式以便可追踪）。

### 表结构

- `articles`：
  - `id` `bigserial` 主键
  - `title` `text`
  - `summary` `text`
  - `content` `text`（Markdown）
  - `category` `text`
  - `created_at` `timestamptz`
  - `views` `int`
- `moments`：
  - `id` `bigserial` 主键
  - `content` `text`
  - `images` `text[]`
  - `likes` `int`
  - `created_at` `timestamptz`

### RPC

- `increment_views(article_id bigint)`
- `increment_likes(moment_id bigint)`

> 如果需要在前端匿名调用 RPC，需要确保对应 RLS/Policy 允许 `rpc` 的执行或通过安全的服务端层代理。

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

- 用 Supabase MCP/控制台确认 `articles`/`moments` 表、RLS、Policy、RPC 已正确生效
- 配置生产环境的 `VITE_SUPABASE_URL`/`VITE_SUPABASE_KEY`（通过部署平台环境变量注入），确保线上读到真库
- 确认 EdgeOne Pages MCP 可用并拿到部署 URL

### P1（强烈建议）

- 鉴权与写操作：
  - 点赞（`increment_likes`）与浏览量（`increment_views`）的权限策略完善
  - 生产环境建议引入 Supabase Auth 或服务端代理，避免滥用
- 数据加载体验：
  - 列表页加 loading / error / empty 状态统一组件
  - 文章/动态分页或无限滚动

### P2（优化）

- 组件按需引入（当前是整包 Element Plus 引入，后续可用自动导入插件减少体积）
- 图片：
  - Moments 图片来源迁移到 Supabase Storage（上传、压缩、鉴权、CDN）
- SEO 与分享：
  - `title/meta` 动态设置，文章详情支持 OG 标签（如需 SSR 可考虑 Nuxt）

## 7. 安全提示（重要）

- 不要在任何文件里提交：
  - Supabase `access token`
  - Supabase `service_role key`
  - EdgeOne `api token`
- 如曾在终端/日志/聊天里暴露过 token，建议立刻在对应平台轮换/作废并重新生成。

