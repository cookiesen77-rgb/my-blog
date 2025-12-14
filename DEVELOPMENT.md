# Cookiesen Blog 开发文档

> 基于 Vue 3 + Supabase 的现代个人博客系统

---

## 目录

1. [技术栈](#技术栈)
2. [项目结构](#项目结构)
3. [本地开发](#本地开发)
4. [环境变量配置](#环境变量配置)
5. [数据库配置](#数据库配置)
6. [核心功能说明](#核心功能说明)
7. [API 接口](#api-接口)
8. [部署指南](#部署指南)
9. [二次开发指南](#二次开发指南)
10. [常见问题](#常见问题)

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue 3 | ^3.4.0 |
| 构建工具 | Vite | ^5.0.0 |
| 路由 | Vue Router | ^4.2.5 |
| UI 组件库 | Element Plus | ^2.4.4 |
| 样式预处理 | Sass | ^1.69.0 |
| Markdown 渲染 | markdown-it | ^14.0.0 |
| 后端服务 | Supabase | ^2.39.0 |
| 部署平台 | Vercel | - |

---

## 项目结构

```
blog/
├── public/                     # 静态资源
│   └── avatar.png              # 默认头像
├── src/
│   ├── api/
│   │   ├── supabase.js         # Supabase API 封装
│   │   └── mock.js             # Mock 数据（降级用）
│   ├── config/
│   │   └── site.js             # 站点配置
│   ├── router/
│   │   └── index.js            # 路由配置
│   ├── styles/
│   │   └── global.scss         # 全局样式
│   ├── views/
│   │   ├── Home.vue            # 首页
│   │   ├── Articles.vue        # 文章列表
│   │   ├── ArticleDetail.vue   # 文章详情
│   │   ├── Moments.vue         # 朋友圈/动态
│   │   └── admin/
│   │       ├── Login.vue       # 后台登录
│   │       └── Dashboard.vue   # 后台管理面板
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
├── supabase/
│   ├── schema.sql              # 数据库表结构
│   ├── storage.sql             # Storage 配置
│   └── README.md               # Supabase 配置说明
├── scripts/                    # 工具脚本
├── .env                        # 环境变量（不提交）
├── .env.example                # 环境变量示例
├── package.json
├── vite.config.js
└── vercel.json                 # Vercel 部署配置
```

---

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 4. 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

---

## 环境变量配置

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL | 是 |
| `VITE_SUPABASE_KEY` | Supabase anon key | 是 |

### 获取 Supabase Keys

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** > **API**
4. 复制 **Project URL** 和 **anon public** key

---

## 数据库配置

### 表结构

#### articles 表（文章）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| title | TEXT | 标题 |
| summary | TEXT | 摘要 |
| content | TEXT | 内容（Markdown） |
| category | TEXT | 分类 |
| created_at | TIMESTAMPTZ | 创建时间 |
| views | INTEGER | 浏览量 |

#### moments 表（动态）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| content | TEXT | 内容 |
| images | TEXT[] | 图片 URL 数组 |
| likes | INTEGER | 点赞数 |
| created_at | TIMESTAMPTZ | 创建时间 |

### RPC 函数

- `increment_views(article_id)` - 增加文章浏览量
- `increment_likes(moment_id)` - 增加动态点赞数

### Storage Buckets

| Bucket 名称 | 用途 | 权限 |
|-------------|------|------|
| `blog-images` | 朋友圈图片 | 公开读写 |
| `avatars` | 用户头像 | 公开读写 |

### 初始化数据库

在 Supabase SQL Editor 中依次执行：

1. `supabase/schema.sql` - 创建表和函数
2. `supabase/storage.sql` - 创建 Storage Buckets

---

## 核心功能说明

### 页面路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | Home.vue | 首页 |
| `/articles` | Articles.vue | 文章列表 |
| `/articles/:id` | ArticleDetail.vue | 文章详情 |
| `/moments` | Moments.vue | 朋友圈 |
| `/admin` | Login.vue | 后台登录 |
| `/admin/dashboard` | Dashboard.vue | 后台管理 |

### 后台管理

- **访问地址**: `/admin`
- **默认密码**: `admin123`
- **密码存储**: localStorage（可在设置中修改）

### 数据降级策略

当 Supabase 未配置时，系统自动降级：
- 从 `src/api/mock.js` 读取空数据
- 图片使用 Base64 存储到 localStorage
- 保证页面可访问不白屏

---

## API 接口

### 文章 API

```javascript
import { 
  getArticles,      // 获取文章列表
  getArticleById,   // 获取单篇文章
  createArticle,    // 创建文章
  updateArticle,    // 更新文章
  deleteArticle,    // 删除文章
  incrementArticleViews  // 增加浏览量
} from '@/api/supabase'
```

### 动态 API

```javascript
import { 
  getMoments,       // 获取动态列表
  getMomentById,    // 获取单条动态
  createMoment,     // 创建动态
  updateMoment,     // 更新动态
  deleteMoment,     // 删除动态
  likeMoment        // 点赞
} from '@/api/supabase'
```

### Storage API

```javascript
import { 
  uploadImage,      // 上传图片
  deleteImage       // 删除图片
} from '@/api/supabase'

// 使用示例
const { data, error } = await uploadImage(file, 'blog-images')
// data.url 为图片公开访问 URL
```

---

## 部署指南

### Vercel 部署（推荐）

#### 方式 1：Git 集成（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
4. 点击 Deploy

#### 方式 2：CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 其他平台

#### Netlify

```bash
npm run build
# 上传 dist/ 目录
```

#### 自托管（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 二次开发指南

### 修改站点信息

编辑 `src/config/site.js`：

```javascript
export const siteConfig = {
  avatar: '/avatar.png',
  nickname: '你的昵称',
  bio: '你的个人简介',
  github: 'https://github.com/your-username'
}
```

### 添加新页面

1. 在 `src/views/` 创建新组件
2. 在 `src/router/index.js` 添加路由：

```javascript
import NewPage from '../views/NewPage.vue'

const routes = [
  // ... 现有路由
  { path: '/new-page', component: NewPage }
]
```

### 修改主题样式

编辑 `src/styles/global.scss`：

```scss
// 自定义主题色
$primary-color: #409EFF;

// 修改全局样式
body {
  background-color: #f9f9f9;
}
```

### 添加新的数据表

1. 在 Supabase SQL Editor 创建表：

```sql
CREATE TABLE IF NOT EXISTS your_table (
  id BIGSERIAL PRIMARY KEY,
  -- 你的字段
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- 添加策略
CREATE POLICY "Allow public read" ON your_table
  FOR SELECT USING (true);
```

2. 在 `src/api/supabase.js` 添加 API：

```javascript
export const getYourData = async () => {
  if (!supabase) return notConfigured()
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
  return { data, error }
}
```

### Element Plus 按需引入（优化打包体积）

安装插件：

```bash
npm install -D unplugin-vue-components unplugin-auto-import
```

修改 `vite.config.js`：

```javascript
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

移除 `main.js` 中的全量引入：

```javascript
// 删除这两行
// import ElementPlus from 'element-plus'
// app.use(ElementPlus)
```

---

## 常见问题

### Q: 发布内容后游客看不到？

**A**: 确保 Supabase 已正确配置。后台发布的内容会保存到数据库，游客页面从数据库读取。

### Q: 图片上传失败？

**A**: 检查 Supabase Storage：
1. `blog-images` 和 `avatars` buckets 是否存在
2. RLS 策略是否允许上传
3. 执行 `supabase/storage.sql` 初始化

### Q: 本地开发正常，生产环境不行？

**A**: 检查 Vercel 环境变量是否配置：
1. 进入 Vercel Dashboard > Settings > Environment Variables
2. 添加 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_KEY`
3. 重新部署

### Q: 如何修改后台密码？

**A**: 
1. 登录后台 `/admin`
2. 进入"个人设置"标签
3. 在"管理密码"输入新密码
4. 点击"保存设置"

### Q: 如何添加评论功能？

**A**: 
1. 创建 `comments` 表
2. 添加对应的 API
3. 在文章详情页添加评论组件
4. 考虑使用 Supabase Auth 进行用户认证

---

## 可用命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 构建
npm run build            # 构建生产版本
npm run preview          # 预览构建结果

# Supabase 工具
npm run setup:storage    # 诊断配置
npm run create:buckets   # 创建 Buckets
npm run verify:setup     # 验证配置

# 部署
npx vercel --prod        # 部署到 Vercel
```

---

## 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/)
- [Supabase 文档](https://supabase.com/docs)
- [Vercel 文档](https://vercel.com/docs)

---

## 更新日志

### v1.0.0 (2024-12-14)

- 初始版本发布
- 支持文章和朋友圈功能
- 集成 Supabase 数据库和 Storage
- 后台管理系统
- 响应式设计

---

**作者**: cookiesen  
**GitHub**: https://github.com/cookiesen77-rgb  
**最后更新**: 2024-12-14

