# Cookiesen Blog

一个基于 **Vue 3 + Supabase** 的现代化个人博客系统，支持文章发布、朋友圈动态、后台管理等功能。

## 在线预览

🌐 **https://blog-six-lake-83.vercel.app**

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Vite |
| UI 组件库 | Element Plus |
| 路由 | Vue Router 4 |
| 样式 | SCSS |
| 后端服务 | Supabase (PostgreSQL + Storage) |
| 部署平台 | Vercel |

---

## 从零开始搭建教程

### 第一步：环境准备

#### 1.1 安装 Node.js
```bash
# 访问 https://nodejs.org 下载安装 LTS 版本
# 验证安装
node -v  # 推荐 v18+
npm -v
```

#### 1.2 创建 Vue 项目
```bash
# 使用 Vite 创建项目
npm create vite@latest my-blog -- --template vue

# 进入项目目录
cd my-blog

# 安装依赖
npm install
```

#### 1.3 安装必要依赖
```bash
# UI 组件库
npm install element-plus @element-plus/icons-vue

# 路由
npm install vue-router@4

# Supabase 客户端
npm install @supabase/supabase-js

# Markdown 渲染
npm install markdown-it

# SCSS 支持
npm install -D sass
```

---

### 第二步：Supabase 后端配置

#### 2.1 创建 Supabase 项目
1. 访问 [supabase.com](https://supabase.com) 并注册账号
2. 点击 **New Project** 创建项目
3. 选择地区（推荐选择离你最近的）
4. 等待项目初始化完成（约 2 分钟）

#### 2.2 获取 API 密钥
1. 进入项目 → **Settings** → **API**
2. 复制以下信息：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIs...`

#### 2.3 创建数据库表
进入 **SQL Editor**，执行以下 SQL：

```sql
-- 文章表
CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  views INTEGER DEFAULT 0
);

-- 朋友圈动态表
CREATE TABLE IF NOT EXISTS moments (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 站点设置表
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  avatar TEXT DEFAULT '/avatar.png',
  nickname TEXT DEFAULT 'Your Name',
  bio TEXT DEFAULT '你的个人简介',
  github TEXT DEFAULT 'https://github.com/your-username',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- 插入默认设置
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 阅读量递增函数
CREATE OR REPLACE FUNCTION increment_views(article_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE articles SET views = views + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- 点赞递增函数
CREATE OR REPLACE FUNCTION increment_likes(moment_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE moments SET likes = likes + 1 WHERE id = moment_id;
END;
$$ LANGUAGE plpgsql;

-- 启用行级安全策略
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 允许公开读取
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Public read moments" ON moments FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public update settings" ON site_settings FOR UPDATE USING (true);
```

#### 2.4 创建存储桶（用于图片上传）
1. 进入 **Storage** → **New Bucket**
2. 名称填写：`blog-images`
3. 勾选 **Public bucket**
4. 点击创建

---

### 第三步：项目结构

```
my-blog/
├── public/
│   └── avatar.png          # 默认头像
├── src/
│   ├── api/
│   │   ├── supabase.js     # Supabase API 封装
│   │   └── mock.js         # 模拟数据（开发用）
│   ├── config/
│   │   └── site.js         # 站点配置
│   ├── router/
│   │   └── index.js        # 路由配置
│   ├── styles/
│   │   └── global.scss     # 全局样式
│   ├── views/
│   │   ├── Home.vue        # 首页
│   │   ├── Articles.vue    # 文章列表
│   │   ├── ArticleDetail.vue # 文章详情
│   │   ├── Moments.vue     # 朋友圈
│   │   └── admin/
│   │       ├── Login.vue   # 后台登录
│   │       └── Dashboard.vue # 后台管理
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── .env                    # 环境变量（不要提交！）
├── .gitignore
├── package.json
├── vite.config.js
└── vercel.json             # Vercel 部署配置
```

---

### 第四步：配置环境变量

#### 4.1 本地开发
在项目根目录创建 `.env` 文件：
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

#### 4.2 确保 .gitignore 包含敏感文件
```gitignore
node_modules
dist
.env
.env.local
.env.production
.vercel
.DS_Store
*.log
```

---

### 第五步：核心代码实现

#### 5.1 Supabase API 封装 (`src/api/supabase.js`)
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// 获取文章列表
export const getArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

// 获取朋友圈
export const getMoments = async () => {
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

// 更多 API...
```

#### 5.2 路由配置 (`src/router/index.js`)
```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/views/Home.vue') },
  { path: '/articles', component: () => import('@/views/Articles.vue') },
  { path: '/articles/:id', component: () => import('@/views/ArticleDetail.vue') },
  { path: '/moments', component: () => import('@/views/Moments.vue') },
  { path: '/admin', component: () => import('@/views/admin/Login.vue') },
  { path: '/admin/dashboard', component: () => import('@/views/admin/Dashboard.vue') }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
```

#### 5.3 Vercel 配置 (`vercel.json`)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

### 第六步：本地开发

```bash
# 启动开发服务器
npm run dev

# 浏览器访问
http://localhost:5173
```

---

### 第七步：部署到 Vercel

#### 7.1 方式一：命令行部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

#### 7.2 方式二：Git 自动部署
1. 将代码推送到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 点击 **Import Project** → 选择你的仓库
4. 配置环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
5. 点击 **Deploy**

#### 7.3 配置环境变量
在 Vercel 项目设置中：
1. 进入 **Settings** → **Environment Variables**
2. 添加：
   | Key | Value |
   |-----|-------|
   | VITE_SUPABASE_URL | https://xxx.supabase.co |
   | VITE_SUPABASE_KEY | eyJhbGciOiJI... |

---

### 第八步：后台管理使用

1. 访问 `/admin` 进入后台登录
2. 默认密码：`admin123`（可在后台修改）
3. 功能：
   - 发布/编辑/删除文章
   - 发布/删除朋友圈动态
   - 修改个人设置（头像、昵称、简介）

---

## 功能特性

- ✅ 响应式设计，支持移动端
- ✅ 文章支持 Markdown 渲染
- ✅ 朋友圈支持多图上传
- ✅ 点赞功能（单用户限制）
- ✅ 文章阅读量统计
- ✅ 后台管理系统
- ✅ 个人设置同步到数据库

---

## 常见问题

### Q: 部署后显示空白页面？
A: 检查 Vercel 环境变量是否正确配置，确保 `VITE_` 前缀。

### Q: 图片上传失败？
A: 确保 Supabase Storage 的 `blog-images` 桶已创建且设为 Public。

### Q: 修改设置后其他设备看不到？
A: 确保 `site_settings` 表已创建，设置会保存到数据库。

---

## 开发文档

详细的二次开发文档请参考 [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## License

MIT © cookiesen

