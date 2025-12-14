# Supabase 数据库配置指南

本目录包含 Cookiesen 博客系统的 Supabase 数据库配置文件。

## 📋 文件说明

| 文件 | 用途 |
|------|------|
| `schema.sql` | 数据库表结构、RPC 函数和 RLS 策略 |
| `storage.sql` | Storage Buckets 和文件访问策略 |

## 🚀 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目或选择现有项目
3. 记录以下信息：
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: 在 Settings > API 中找到

### 2. 执行数据库脚本

在 Supabase Dashboard 中执行以下步骤：

#### 步骤 A: 创建数据库表和函数

1. 打开 **SQL Editor** (左侧菜单)
2. 点击 **New Query**
3. 复制 `schema.sql` 的全部内容
4. 粘贴到编辑器中
5. 点击 **Run** 执行

**预期结果**:
- ✅ 创建 `articles` 表
- ✅ 创建 `moments` 表
- ✅ 创建 `increment_views()` RPC 函数
- ✅ 创建 `increment_likes()` RPC 函数
- ✅ 设置 Row Level Security (RLS) 策略

#### 步骤 B: 创建 Storage Buckets

1. 在同一个 **SQL Editor** 中
2. 新建查询 (New Query)
3. 复制 `storage.sql` 的全部内容
4. 粘贴到编辑器中
5. 点击 **Run** 执行

**预期结果**:
- ✅ 创建 `blog-images` bucket (用于朋友圈图片)
- ✅ 创建 `avatars` bucket (用于用户头像)
- ✅ 设置公开读取策略
- ✅ 设置上传/删除策略

### 3. 验证配置

#### 验证数据库表

```sql
-- 在 SQL Editor 中运行
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

应该看到:
- `articles`
- `moments`

#### 验证 Storage Buckets

1. 打开 **Storage** (左侧菜单)
2. 应该看到两个 buckets:
   - `blog-images`
   - `avatars`
3. 点击每个 bucket，确认 **Public** 已启用

### 4. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key-here
```

> ⚠️ **重要**: 不要将 `.env` 提交到 Git！请确保它在 `.gitignore` 中。

### 5. 测试连接

本地运行项目测试:

```bash
npm install
npm run dev
```

访问 `http://localhost:5173`，检查：
- ✅ 首页正常显示
- ✅ 文章列表可以加载
- ✅ 朋友圈可以加载

## 🔐 安全建议

### 开发环境 (当前配置)

当前配置允许匿名用户上传/删除文件，适合：
- ✅ 个人博客
- ✅ 开发和测试
- ✅ 小规模应用

### 生产环境建议

1. **启用 Supabase Auth**
   ```sql
   -- 修改策略，限制为已认证用户
   CREATE POLICY "Authenticated Upload"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'blog-images'
     AND auth.role() = 'authenticated'
   );
   ```

2. **限制文件大小**
   - 在 Storage > Bucket Settings 中设置
   - 推荐: 5MB for images, 1MB for avatars

3. **限制文件类型**
   - 在 Bucket Settings 中配置 Allowed MIME types
   - 推荐: `image/jpeg, image/png, image/webp, image/gif`

4. **添加所有者检查**
   ```sql
   -- 只允许删除自己上传的文件
   CREATE POLICY "Owner Delete"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'blog-images'
     AND auth.uid() = owner
   );
   ```

## 🛠️ 常见问题

### Q: "Supabase 未配置" 错误

**原因**: 环境变量未正确设置

**解决**:
1. 确认 `.env` 文件存在于项目根目录
2. 确认环境变量名称正确: `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_KEY`
3. 重启开发服务器

### Q: 图片上传失败

**可能原因**:
1. Storage buckets 未创建 → 执行 `storage.sql`
2. RLS 策略未设置 → 检查 Storage > Policies
3. Bucket 未设置为 Public → 在 Bucket Settings 中启用

**调试步骤**:
```javascript
// 在浏览器控制台检查错误
import { uploadImage } from '@/api/supabase'

const testFile = new File(['test'], 'test.png', { type: 'image/png' })
const result = await uploadImage(testFile)
console.log(result) // 查看错误信息
```

### Q: RLS 策略报错

**解决**: 确保按顺序执行：
1. 先执行 `schema.sql` (创建表)
2. 再执行 `storage.sql` (创建 buckets)

## 📚 相关文档

- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

## 💡 提示

- 使用 Supabase Dashboard 的 **API Docs** 查看自动生成的 API 文档
- 在 **Table Editor** 中可以手动添加测试数据
- **Storage** 页面可以直接上传文件测试
