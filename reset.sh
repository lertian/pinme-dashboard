#!/bin/bash

echo "🔄 开始彻底重置项目环境..."

# 1. 清理 npm 缓存
echo "🧹 清理 NPM 缓存..."
npm cache clean --force

# 2. 删除所有 node_modules 和锁文件
echo "🗑️  删除 node_modules 和锁文件..."
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf example/supabase/node_modules example/supabase/package-lock.json

# 3. 顺序安装依赖
echo "📦 安装根目录依赖..."
npm install

echo "📦 安装后端 (Backend) 依赖..."
cd backend && npm install && cd ..

echo "📦 安装前端 (Frontend) 依赖..."
cd example/supabase && npm install && cd ../..

echo "✅ 环境重置完成！"
echo "🚀 现在您可以运行: npm run start-app"
