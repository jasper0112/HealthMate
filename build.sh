#!/bin/bash

# HealthMate 项目构建脚本
# 用途：首次下载或解压项目后，使用此脚本构建后端并启动服务

set -e  # 遇到错误立即退出

echo "🚀 开始构建 HealthMate 项目..."
echo ""

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 1. 进入后端目录并构建
echo "📦 步骤 1/3: 构建后端 JAR 文件..."
cd backend

# 检查 mvnw 是否存在
if [ ! -f "mvnw" ]; then
    echo "❌ 错误：找不到 mvnw 文件"
    exit 1
fi

# 添加执行权限（如果需要）
if [ ! -x "mvnw" ]; then
    echo "🔧 为 Maven Wrapper 添加执行权限..."
    chmod +x mvnw
fi

# 构建项目
echo "🔨 运行 Maven 构建..."
./mvnw clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "❌ Maven 构建失败"
    exit 1
fi

# 检查 JAR 文件是否生成
if [ ! -f "target/backend-0.0.1-SNAPSHOT.jar" ]; then
    echo "❌ 错误：JAR 文件未生成"
    exit 1
fi

echo "✅ 后端构建成功！"
cd ..

# 2. 检查 Docker 是否运行
echo ""
echo "🐳 步骤 2/3: 检查 Docker 环境..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ 错误：Docker 未运行，请先启动 Docker Desktop"
    exit 1
fi
echo "✅ Docker 正在运行"

# 3. 启动 Docker Compose
echo ""
echo "🚀 步骤 3/3: 启动 Docker Compose 服务..."
docker compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Docker Compose 启动失败"
    exit 1
fi

echo ""
echo "✅ 构建和启动完成！"
echo ""
echo "📊 服务状态："
docker compose ps
echo ""
echo "📝 查看日志："
echo "   - 后端日志: docker compose logs -f backend"
echo "   - 前端日志: docker compose logs -f frontend"
echo "   - 所有日志: docker compose logs -f"
echo ""
echo "🌐 服务地址："
echo "   - 前端: http://localhost:3000"
echo "   - 后端: http://localhost:8080"
echo ""
echo "🛑 停止服务: docker compose down"
echo "🔄 重启服务: docker compose restart"

