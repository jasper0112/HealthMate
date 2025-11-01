@echo off
REM HealthMate 项目构建脚本 (Windows 批处理版本)
REM 用途：首次下载或解压项目后，使用此脚本构建后端并启动服务

chcp 65001 >nul
echo 🚀 开始构建 HealthMate 项目...
echo.

REM 检查是否在项目根目录
if not exist "docker-compose.yml" (
    echo ❌ 错误：请在项目根目录运行此脚本
    pause
    exit /b 1
)

REM 1. 进入后端目录并构建
echo 📦 步骤 1/3: 构建后端 JAR 文件...
cd backend

REM 检查 mvnw.cmd 是否存在
if not exist "mvnw.cmd" (
    echo ❌ 错误：找不到 mvnw.cmd 文件
    cd ..
    pause
    exit /b 1
)

REM 构建项目
echo 🔨 运行 Maven 构建...
call mvnw.cmd clean package -DskipTests

if errorlevel 1 (
    echo ❌ Maven 构建失败
    cd ..
    pause
    exit /b 1
)

REM 检查 JAR 文件是否生成
if not exist "target\backend-0.0.1-SNAPSHOT.jar" (
    echo ❌ 错误：JAR 文件未生成
    cd ..
    pause
    exit /b 1
)

echo ✅ 后端构建成功！
cd ..

REM 2. 检查 Docker 是否运行
echo.
echo 🐳 步骤 2/3: 检查 Docker 环境...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：Docker 未运行，请先启动 Docker Desktop
    pause
    exit /b 1
)
echo ✅ Docker 正在运行

REM 3. 检查 .env 文件
if not exist ".env" (
    echo.
    echo ⚠️  警告：未找到 .env 文件
    if exist "env.example" (
        echo 📝 正在从模板创建 .env 文件...
        copy /Y env.example .env >nul
        echo ✅ .env 文件已创建，请编辑它并设置 MYSQL_ROOT_PASSWORD
    ) else (
        echo ❌ 错误：找不到 env.example 模板文件
        pause
        exit /b 1
    )
)

REM 4. 启动 Docker Compose
echo.
echo 🚀 步骤 3/3: 启动 Docker Compose 服务...
docker compose up -d

if errorlevel 1 (
    echo ❌ Docker Compose 启动失败
    pause
    exit /b 1
)

echo.
echo ✅ 构建和启动完成！
echo.
echo 📊 服务状态：
docker compose ps
echo.
echo 📝 查看日志：
echo    - 后端日志: docker compose logs -f backend
echo    - 前端日志: docker compose logs -f frontend
echo    - 所有日志: docker compose logs -f
echo.
echo 🌐 服务地址：
echo    - 前端: http://localhost:3000
echo    - 后端: http://localhost:8080
echo.
echo 🛑 停止服务: docker compose down
echo 🔄 重启服务: docker compose restart
echo.
pause

