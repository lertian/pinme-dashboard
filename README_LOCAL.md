# PinMe 本地版 - 快速启动指南

## 🎯 架构说明

本项目已改造为**完全本地化**方案：
- **后端**: Node.js + Express + SQLite
- **前端**: React + TypeScript + Vite
- **数据库**: SQLite（单文件数据库）
- **文件存储**: 本地文件系统

**无需任何云服务，开箱即用！**

---

## 🚀 快速启动

### 方式一：一键启动（推荐）

在项目根目录下，直接运行：

```bash
npm run start-app
```

该命令会自动同时启动后端服务（端口 3001）和前端应用（端口 5173）。

> **前提条件**：首次运行前，请确保已执行过“环境准备”中的安装和初始化步骤。

---

### 方式二：手动分步启动

#### 第一步：启动后端服务

```bash
cd backend
npm install
npm run init-db  # 初始化数据库
npm run dev      # 启动后端服务
```

**输出示例**：
```
🗄️  初始化数据库...
✅ 默认管理员账户已创建
   用户名: admin
   密码: admin123
   ⚠️  请在首次登录后修改密码！
✅ 数据库初始化完成！
📍 数据库位置: /path/to/database.db

🚀 服务器运行在 http://localhost:3001
📁 文件上传目录: ./uploads
🗄️  数据库: ./database.db
```

### 第二步：启动前端服务

**打开新终端窗口**：

```bash
cd example/supabase
npm install --legacy-peer-deps
npm run dev
```

**输出示例**：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 第三步：访问应用

打开浏览器访问：**http://localhost:5173**

---

## 👤 默认账户

**管理员账户**：
- 用户名: `admin`
- 密码: `admin123`

**⚠️ 重要**：首次登录后请立即修改密码！

---

## 📁 项目结构

```
pinme-main/
├── backend/                    # 后端服务
│   ├── server.js              # Express 服务器
│   ├── db.js                  # 数据库连接
│   ├── scripts/
│   │   └── init-db.js         # 数据库初始化脚本
│   ├── uploads/               # 文件上传目录（自动创建）
│   ├── database.db            # SQLite 数据库（自动创建）
│   └── package.json
│
└── example/supabase/          # 前端应用
    ├── src/
    │   ├── pages/             # 页面组件
    │   ├── components/        # 通用组件
    │   ├── utils/             # 工具函数
    │   └── contexts/          # React Context
    └── package.json
```

---

## 🔧 功能清单

### ✅ 用户功能
- [x] 用户注册（用户名 + 密码）
- [x] 用户登录
- [x] 项目列表查看
- [x] 上传新项目（文件夹）
- [x] 更新项目版本
- [x] 删除项目
- [x] 在线预览项目

### ✅ 管理员功能
- [x] 查看所有用户
- [x] 查看用户项目统计
- [x] 重置用户密码

---

## 📝 使用流程

### 1. 注册新用户
1. 访问 http://localhost:5173/#/register
2. 输入用户名（至少3个字符）和密码
3. 点击"注册"

### 2. 上传项目
1. 登录后，点击"上传新项目"
2. 输入项目名称
3. 选择包含 `index.html` 的文件夹
4. 点击"开始上传"

### 3. 预览项目
- 上传成功后，点击项目卡片上的"预览"按钮
- 访问地址类似：`http://localhost:3001/uploads/project-xxx/index.html`

### 4. 更新版本
1. 点击项目卡片上的"更新版本"
2. 选择新的文件夹
3. 点击"上传并更新"

### 5. 管理员功能
1. 使用 `admin` 账户登录
2. 点击顶部"用户管理"
3. 可以查看所有用户并重置密码

---

## 🐛 常见问题

### Q1: 后端启动失败

**检查**：
- 端口 3001 是否被占用？
- 是否已运行 `npm install`？

**解决**：
```bash
# 检查端口占用
lsof -i :3001

# 修改端口（编辑 backend/.env）
PORT=3002
```

### Q2: 前端无法连接后端

**检查**：
- 后端是否正常运行？
- 浏览器控制台是否有 CORS 错误？

**解决**：
- 确保后端运行在 `http://localhost:3001`
- 检查 `src/utils/api.ts` 中的 `API_BASE_URL`

### Q3: 文件上传失败

**检查**：
- 文件夹是否包含 `index.html`？
- `backend/uploads` 目录是否有写入权限？

**解决**：
```bash
# 创建上传目录
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### Q4: 数据库错误

**解决**：
```bash
# 删除数据库并重新初始化
cd backend
rm database.db
npm run init-db
```

---

## 🔒 安全建议

1. **修改默认密码**：首次登录后立即修改 admin 密码
2. **修改 JWT Secret**：编辑 `backend/.env`，修改 `JWT_SECRET`
3. **生产环境**：
   - 使用 HTTPS
   - 配置防火墙
   - 定期备份数据库

---

## 📦 数据备份

### 备份数据库
```bash
cp backend/database.db backend/database.db.backup
```

### 备份上传文件
```bash
tar -czf uploads-backup.tar.gz backend/uploads/
```

---

## 🎨 自定义配置

### 修改端口

**后端** (`backend/.env`):
```env
PORT=3002
```

**前端** (`example/supabase/src/utils/api.ts`):
```typescript
const API_BASE_URL = 'http://localhost:3002/api';
```

### 修改上传目录

编辑 `backend/.env`:
```env
UPLOAD_DIR=/path/to/your/uploads
```

---

## 🚀 生产部署

### 1. 构建前端
```bash
cd example/supabase
npm run build
```

### 2. 配置后端服务静态文件
在 `backend/server.js` 添加：
```javascript
app.use(express.static('../example/supabase/dist'));
```

### 3. 使用 PM2 管理进程
```bash
npm install -g pm2
cd backend
pm2 start server.js --name pinme-backend
pm2 save
pm2 startup
```

---

## 📚 下一步

- [ ] 添加用户修改密码功能
- [ ] 添加项目搜索功能
- [ ] 添加项目版本历史查看
- [ ] 集成真实的 IPFS 上传（可选）
- [ ] 添加用户头像上传
- [ ] 添加项目分享功能

---

## 💬 需要帮助？

如有问题，请检查：
1. 后端终端输出
2. 前端浏览器控制台
3. 数据库文件是否存在

祝您使用愉快！🎉
