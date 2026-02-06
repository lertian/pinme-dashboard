import bcrypt from 'bcryptjs';
import { initDatabase, run, get, saveDatabase } from '../db.js';

console.log('🗄️  初始化数据库...');

const main = async () => {
  await initDatabase();

  // 创建用户表
  run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME
    )
  `);

  // 创建项目表
  run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      current_cid TEXT,
      preview_url TEXT,
      domain TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME,
      is_private INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 创建项目版本表
  run(`
    CREATE TABLE IF NOT EXISTS project_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      version_number INTEGER NOT NULL,
      ipfs_cid TEXT NOT NULL,
      preview_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);

  // 创建默认管理员账户
  const adminPassword = bcrypt.hashSync('admin123', 10);

  const existingAdmin = get('SELECT id FROM users WHERE username = ?', ['admin']);

  if (!existingAdmin) {
    run(`
      INSERT INTO users (username, password_hash, is_admin)
      VALUES (?, ?, 1)
    `, ['admin', adminPassword]);
    console.log('✅ 默认管理员账户已创建');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
  } else {
    console.log('ℹ️  管理员账户已存在');
  }

  saveDatabase();
  console.log('✅ 数据库初始化完成！');
};

main().catch(console.error);
