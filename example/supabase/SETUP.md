# Supabase 配置和部署指南

## 🚀 快速开始

### 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com) 并注册/登录
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**: `pinme-project-manager`（或您喜欢的名字）
   - **Database Password**: 设置一个强密码（请记住！）
   - **Region**: 选择离您最近的区域（如 `Northeast Asia (Tokyo)`）
4. 点击 "Create new project"，等待 1-2 分钟初始化完成

### 2. 获取 API 凭据

项目创建完成后：

1. 在左侧菜单点击 **⚙️ Settings** → **API**
2. 找到以下信息：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public**: 一串很长的 JWT token

### 3. 配置环境变量

在 `example/supabase` 目录下创建 `.env` 文件：

```bash
cd example/supabase
cp .env.example .env
```

编辑 `.env` 文件，填入您的凭据：

```env
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon_key
```

### 4. 执行数据库迁移

在 Supabase Dashboard 中：

1. 点击左侧菜单 **🗄️ SQL Editor**
2. 点击 "New query"
3. 复制 `supabase/migrations/20260206000000_init_schema.sql` 的全部内容
4. 粘贴到编辑器中
5. 点击 **Run** 按钮执行

**验证**：执行后，点击左侧 **🗂️ Table Editor**，应该能看到：
- `user_profiles`
- `projects`
- `project_versions`

### 5. 创建管理员账户

在 SQL Editor 中执行以下 SQL（创建默认管理员）：

```sql
-- 注意：这里需要先通过应用注册一个用户，然后将其设为管理员
-- 或者使用 Supabase Auth UI 创建用户后执行：

-- 假设您已经注册了一个用户名为 admin 的账户
-- 找到该用户的 ID 并更新为管理员
UPDATE user_profiles 
SET is_admin = true 
WHERE username = 'admin';
```

**或者**，先在应用中注册一个用户（用户名：admin），然后在 SQL Editor 执行上面的 SQL。

### 6. 启动开发服务器

```bash
cd example/supabase
npm install
npm run dev
```

访问 `http://localhost:5173`（或终端显示的地址）

---

## 🔧 IPFS 配置（可选）

目前代码使用的是 **Mock 上传**（模拟上传），如果您想使用真实的 IPFS 上传：

### 方案 A：使用 PinMe 现有的 IPFS API

修改 `src/utils/upload.ts`，集成 PinMe 的上传逻辑：

```typescript
import uploadToIpfsSplit from '../../../bin/utils/uploadToIpfsSplit';

export const uploadToIPFS = async (files: FileList | File[]): Promise<{ cid: string; previewUrl: string }> => {
  // 将 FileList 转换为临时目录
  const tempDir = await createTempDirectory(files);
  
  // 调用 PinMe 的上传函数
  const result = await uploadToIpfsSplit(tempDir);
  
  if (!result?.contentHash) {
    throw new Error("上传失败");
  }
  
  return {
    cid: result.contentHash,
    previewUrl: `https://${result.contentHash}.pinit.eth.limo`,
  };
};
```

### 方案 B：使用 Supabase Storage

如果不想用 IPFS，可以改用 Supabase Storage：

1. 在 Supabase Dashboard 创建 Storage Bucket：
   - 点击 **📦 Storage**
   - 点击 "Create a new bucket"
   - Name: `projects`
   - Public: ✅ 勾选

2. 修改 `src/utils/upload.ts`：

```typescript
import { supabase } from "./supabase";

export const uploadToIPFS = async (files: FileList | File[]): Promise<{ cid: string; previewUrl: string }> => {
  const projectId = `project-${Date.now()}`;
  
  // 上传所有文件到 Supabase Storage
  for (const file of Array.from(files)) {
    const filePath = `${projectId}/${file.name}`;
    const { error } = await supabase.storage
      .from('projects')
      .upload(filePath, file);
    
    if (error) throw error;
  }
  
  // 生成公开访问 URL
  const { data } = supabase.storage
    .from('projects')
    .getPublicUrl(`${projectId}/index.html`);
  
  return {
    cid: projectId,
    previewUrl: data.publicUrl,
  };
};
```

---

## 🎯 测试流程

### 1. 注册第一个用户

1. 访问 `http://localhost:5173/#/register`
2. 输入：
   - 用户名: `admin`
   - 密码: `123456`（或更强的密码）
   - 确认密码: `123456`
3. 点击注册

### 2. 设置为管理员

在 Supabase SQL Editor 执行：

```sql
UPDATE user_profiles 
SET is_admin = true 
WHERE username = 'admin';
```

### 3. 测试功能

1. **登录**: 使用 admin 账户登录
2. **上传项目**: 点击"上传新项目"，选择包含 `index.html` 的文件夹
3. **查看项目**: 应该能看到项目卡片
4. **管理员功能**: 点击顶部"用户管理"，查看所有用户

---

## 🐛 常见问题

### Q1: 无法连接到 Supabase

**检查**：
- `.env` 文件是否正确配置
- Supabase 项目是否已启动（Dashboard 显示绿色）
- 网络是否正常

### Q2: 数据库表不存在

**解决**：
- 确保已执行 SQL 迁移脚本
- 在 Table Editor 中检查表是否存在

### Q3: 注册后无法登录

**检查**：
- 在 Supabase Dashboard → Authentication → Users 中查看用户是否创建成功
- 检查浏览器控制台是否有错误信息

### Q4: RLS 策略错误

**解决**：
- 确保 SQL 迁移脚本完整执行
- 在 SQL Editor 中检查 RLS 策略：

```sql
SELECT * FROM pg_policies WHERE tablename IN ('user_profiles', 'projects', 'project_versions');
```

---

## 📚 下一步

完成配置后，您可以：

1. ✅ 测试完整的注册/登录流程
2. ✅ 上传测试项目
3. ✅ 测试管理员功能
4. 🔄 集成真实的 IPFS 上传（如果需要）
5. 🎨 自定义 UI 样式

有任何问题随时告诉我！
