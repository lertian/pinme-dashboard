#!/bin/bash

echo "🚀 PinMe 项目管理系统 - 快速启动"
echo "================================"
echo ""

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "❌ 错误：.env 文件不存在"
    echo "请先复制 .env.example 为 .env 并填入您的 Supabase 凭据"
    echo ""
    echo "运行以下命令："
    echo "  cp .env.example .env"
    echo "  然后编辑 .env 文件"
    exit 1
fi

# 检查是否已配置
if grep -q "your_supabase" .env; then
    echo "⚠️  警告：.env 文件似乎还未配置"
    echo "请编辑 .env 文件，填入您的 Supabase 凭据："
    echo "  - VITE_SUPABASE_URL"
    echo "  - VITE_SUPABASE_ANON_KEY"
    echo ""
    read -p "是否继续启动？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ 环境检查通过"
echo "📦 启动开发服务器..."
echo ""

npm run dev
