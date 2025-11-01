# HealthMate 项目构建脚本 (Windows PowerShell 版本)
# 用途：首次下载或解压项目后，使用此脚本构建后端并启动服务

$ErrorActionPreference = "Stop"

Write-Host "🚀 开始构建 HealthMate 项目..." -ForegroundColor Cyan
Write-Host ""

# 检查是否在项目根目录
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ 错误：请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 1. 进入后端目录并构建
Write-Host "📦 步骤 1/3: 构建后端 JAR 文件..." -ForegroundColor Yellow
Push-Location backend

# 检查 mvnw.cmd 是否存在
if (-not (Test-Path "mvnw.cmd")) {
    Write-Host "❌ 错误：找不到 mvnw.cmd 文件" -ForegroundColor Red
    Pop-Location
    exit 1
}

# 构建项目
Write-Host "🔨 运行 Maven 构建..." -ForegroundColor Yellow
& .\mvnw.cmd clean package -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Maven 构建失败" -ForegroundColor Red
    Pop-Location
    exit 1
}

# 检查 JAR 文件是否生成
if (-not (Test-Path "target\backend-0.0.1-SNAPSHOT.jar")) {
    Write-Host "❌ 错误：JAR 文件未生成" -ForegroundColor Red
    Pop-Location
    exit 1
}

$jarSize = (Get-Item "target\backend-0.0.1-SNAPSHOT.jar").Length / 1MB
Write-Host "✅ 后端构建成功！(JAR 大小: $([math]::Round($jarSize, 2)) MB)" -ForegroundColor Green
Pop-Location

# 2. 检查 Docker 是否运行
Write-Host ""
Write-Host "🐳 步骤 2/3: 检查 Docker 环境..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker 正在运行" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误：Docker 未运行，请先启动 Docker Desktop" -ForegroundColor Red
    exit 1
}

# 3. 检查 .env 文件
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "⚠️  警告：未找到 .env 文件" -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Write-Host "📝 正在从模板创建 .env 文件..." -ForegroundColor Yellow
        Copy-Item "env.example" ".env"
        Write-Host "✅ .env 文件已创建，请编辑它并设置 MYSQL_ROOT_PASSWORD" -ForegroundColor Yellow
    } else {
        Write-Host "❌ 错误：找不到 env.example 模板文件" -ForegroundColor Red
        exit 1
    }
}

# 4. 启动 Docker Compose
Write-Host ""
Write-Host "🚀 步骤 3/3: 启动 Docker Compose 服务..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker Compose 启动失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ 构建和启动完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📊 服务状态：" -ForegroundColor Cyan
docker compose ps
Write-Host ""
Write-Host "📝 查看日志：" -ForegroundColor Cyan
Write-Host "   - 后端日志: docker compose logs -f backend" -ForegroundColor White
Write-Host "   - 前端日志: docker compose logs -f frontend" -ForegroundColor White
Write-Host "   - 所有日志: docker compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "🌐 服务地址：" -ForegroundColor Cyan
Write-Host "   - 前端: http://localhost:3000" -ForegroundColor White
Write-Host "   - 后端: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "🛑 停止服务: docker compose down" -ForegroundColor Yellow
Write-Host "🔄 重启服务: docker compose restart" -ForegroundColor Yellow

