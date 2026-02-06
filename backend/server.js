import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initDatabase, run, get, all, saveDatabase } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const UPLOAD_DIR = path.isAbsolute(process.env.UPLOAD_DIR || './uploads')
    ? process.env.UPLOAD_DIR
    : path.resolve(__dirname, process.env.UPLOAD_DIR || './uploads');

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 中间件
app.use(cors({
    origin: 'http://localhost:3030',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// JWT 验证中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '未授权' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: '令牌无效' });
        }
        req.user = user;
        next();
    });
};

// 后台静默验证（不报错，仅识别身份）
const optionalAuthenticate = (req, res, next) => {
    // 优先从 Authorization header 读取
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    // 如果 header 中没有，尝试从 Cookie 中读取
    if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // 如果还是没有，尝试从 query 参数读取
    if (!token && req.query.token) {
        token = req.query.token;
    }

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) req.user = user;
            next();
        });
    } else {
        next();
    }
};

// 文件上传配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = path.join(UPLOAD_DIR, 'tmp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// 静态文件服务
app.use('/uploads', express.static(UPLOAD_DIR));

// 项目访问门面路由（带权限检查）
app.get('/p/:cid*', optionalAuthenticate, (req, res) => {
    const cid = req.params.cid;
    const subPath = req.params[0] || '';
    const project = get('SELECT * FROM projects WHERE current_cid = ?', [cid]);

    if (!project) return res.status(404).send('Project Not Found');

    // 隐私检查
    if (project.is_private) {
        // 已登录但不是所有者
        if (req.user && req.user.id !== project.user_id && !req.user.is_admin) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>无权访问</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                        }
                        .container {
                            background: white;
                            padding: 3rem;
                            border-radius: 16px;
                            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                            text-align: center;
                            max-width: 400px;
                        }
                        h1 { color: #333; margin-bottom: 1rem; }
                        p { color: #666; margin-bottom: 2rem; line-height: 1.6; }
                        .btn {
                            display: inline-block;
                            padding: 12px 32px;
                            background: #f5576c;
                            color: white;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: 600;
                            transition: all 0.3s;
                        }
                        .btn:hover {
                            background: #e04758;
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
                        }
                        .icon { font-size: 48px; margin-bottom: 1rem; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="icon">🚫</div>
                        <h1>无权访问</h1>
                        <p>该项目已被设为私有，仅限所有者访问。<br>您当前登录的账号无权查看此项目。</p>
                        <a href="http://localhost:3030" class="btn">返回首页</a>
                    </div>
                </body>
                </html>
            `);
        }

        // 未登录
        if (!req.user) {
            const loginUrl = `http://localhost:3030/login?redirect=${encodeURIComponent(req.originalUrl)}`;
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>需要登录</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        }
                        .container {
                            background: white;
                            padding: 3rem;
                            border-radius: 16px;
                            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                            text-align: center;
                            max-width: 400px;
                        }
                        h1 { color: #333; margin-bottom: 1rem; }
                        p { color: #666; margin-bottom: 2rem; line-height: 1.6; }
                        .btn {
                            display: inline-block;
                            padding: 12px 32px;
                            background: #667eea;
                            color: white;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: 600;
                            transition: all 0.3s;
                        }
                        .btn:hover {
                            background: #5568d3;
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                        }
                        .icon { font-size: 48px; margin-bottom: 1rem; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="icon">🔒</div>
                        <h1>私有项目</h1>
                        <p>该项目已被设为私有，仅限所有者访问。<br>请先登录以验证您的身份。</p>
                        <a href="${loginUrl}" class="btn">前往登录</a>
                    </div>
                </body>
                </html>
            `);
        }
    }

    const projectPath = path.join(UPLOAD_DIR, cid);

    // 如果没有指定子路径，查找并返回入口 HTML 文件
    if (!subPath || subPath === '/') {
        try {
            const files = fs.readdirSync(projectPath);
            const htmlFile = files.find(f => f === 'index.html') || files.find(f => f.toLowerCase().endsWith('.html'));
            if (htmlFile) {
                // 读取 HTML 文件内容
                const htmlPath = path.join(projectPath, htmlFile);
                let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

                // 注入 base 标签，确保相对路径资源正确加载
                const baseTag = `<base href="/p/${cid}/">`;
                if (htmlContent.includes('<head>')) {
                    htmlContent = htmlContent.replace('<head>', `<head>\n    ${baseTag}`);
                } else if (htmlContent.includes('<html>')) {
                    htmlContent = htmlContent.replace('<html>', `<html>\n<head>\n    ${baseTag}\n</head>`);
                }

                return res.send(htmlContent);
            }
        } catch (e) {
            return res.status(404).send('Resource Not Found');
        }
    }

    const filePath = path.join(projectPath, subPath);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Resource Not Found');
    }

    res.sendFile(filePath);
});

// ============ 认证 API ============

app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
    const passwordHash = bcrypt.hashSync(password, 10);
    try {
        run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash]);
        const user = get('SELECT id, username, is_admin, created_at FROM users WHERE username = ?', [username]);
        const token = jwt.sign({ id: user.id, username: user.username, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ user, token });
    } catch (err) {
        res.status(400).json({ error: '用户名已存在' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: '用户名或密码错误' });
    }
    run('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    const token = jwt.sign({ id: user.id, username: user.username, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
        user: { id: user.id, username: user.username, is_admin: user.is_admin, created_at: user.created_at },
        token
    });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = get('SELECT id, username, is_admin, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(user);
});

// 修改自己密码
app.post('/api/auth/change-password', authenticateToken, (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);

    if (!bcrypt.compareSync(oldPassword, user.password_hash)) {
        return res.status(400).json({ error: '原密码错误' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ success: true });
});

// 切换可见性
app.post('/api/projects/:id/toggle-private', authenticateToken, (req, res) => {
    const project = get('SELECT * FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!project) return res.status(404).json({ error: '项目不存在' });

    const newValue = project.is_private ? 0 : 1;
    run('UPDATE projects SET is_private = ? WHERE id = ?', [newValue, req.params.id]);
    res.json({ is_private: newValue });
});

// ============ 项目 API ============

app.get('/api/projects', authenticateToken, (req, res) => {
    const projects = all('SELECT * FROM projects WHERE user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC', [req.user.id]);
    res.json(projects);
});

app.post('/api/projects', authenticateToken, upload.array('files'), (req, res) => {
    const { name } = req.body;
    const files = req.files;
    if (!name || !files || files.length === 0) return res.status(400).json({ error: '名称和文件不能为空' });

    const projectId = `project-${Date.now()}`;
    const projectDir = path.join(UPLOAD_DIR, projectId);
    fs.mkdirSync(projectDir, { recursive: true });

    files.forEach(file => {
        const relativePath = file.originalname.replace(/\\/g, '/');
        const targetPath = path.join(projectDir, relativePath);
        const dir = path.dirname(targetPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.renameSync(file.path, targetPath);
    });

    const previewUrl = `http://localhost:${PORT}/p/${projectId}`;
    run('INSERT INTO projects (user_id, name, current_cid, preview_url) VALUES (?, ?, ?, ?)', [req.user.id, name, projectId, previewUrl]);
    const row = get('SELECT last_insert_rowid() as id');
    const projectDbId = row.id;
    run('INSERT INTO project_versions (project_id, version_number, ipfs_cid, preview_url) VALUES (?, 1, ?, ?)', [projectDbId, projectId, previewUrl]);

    const project = get('SELECT * FROM projects WHERE id = ?', [projectDbId]);
    res.json(project);
});

app.post('/api/projects/:id/update', authenticateToken, upload.array('files'), (req, res) => {
    const projectId = req.params.id;
    const files = req.files;
    const project = get('SELECT * FROM projects WHERE id = ? AND user_id = ?', [projectId, req.user.id]);
    if (!project) return res.status(404).json({ error: '项目不存在' });

    const newCid = `project-${Date.now()}`;
    const projectDir = path.join(UPLOAD_DIR, newCid);
    fs.mkdirSync(projectDir, { recursive: true });

    files.forEach(file => {
        const relativePath = file.originalname.replace(/\\/g, '/');
        const targetPath = path.join(projectDir, relativePath);
        const dir = path.dirname(targetPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.renameSync(file.path, targetPath);
    });

    const previewUrl = `http://localhost:${PORT}/p/${newCid}`;
    run('UPDATE projects SET current_cid = ?, preview_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newCid, previewUrl, projectId]);

    const latest = get('SELECT MAX(version_number) as v FROM project_versions WHERE project_id = ?', [projectId]);
    const nextV = (latest.v || 0) + 1;
    run('INSERT INTO project_versions (project_id, version_number, ipfs_cid, preview_url) VALUES (?, ?, ?, ?)', [projectId, nextV, newCid, previewUrl]);

    res.json(get('SELECT * FROM projects WHERE id = ?', [projectId]));
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
    run('UPDATE projects SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
});

// ============ 管理员 API ============

app.get('/api/admin/users', authenticateToken, (req, res) => {
    if (!req.user.is_admin) return res.status(403).json({ error: '权限不足' });
    const users = all(`
    SELECT u.id, u.username, u.is_admin, u.created_at, COUNT(p.id) as project_count
    FROM users u
    LEFT JOIN projects p ON u.id = p.user_id AND p.deleted_at IS NULL
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);
    res.json(users);
});

app.post('/api/admin/users/:id/reset-password', authenticateToken, (req, res) => {
    if (!req.user.is_admin) return res.status(403).json({ error: '权限不足' });
    const { newPassword } = req.body;
    const hash = bcrypt.hashSync(newPassword, 10);
    run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.params.id]);
    res.json({ success: true });
});

// ============ 初始化并启动 ============

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
        console.log(`📁 文件上传目录: ${UPLOAD_DIR}`);
    });
}).catch(console.error);
