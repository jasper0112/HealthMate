# 构建阶段：安装依赖并构建
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 设置 npm 镜像源（避免下载超时）
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖（包含 SWC）
RUN npm ci

# 复制源代码
COPY . .

# 构建项目（会下载并编译 SWC）
RUN npm run build

# 运行阶段：只运行已构建的产物
FROM node:20-alpine AS runner

WORKDIR /app

# 设置非 root 用户（安全）
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 从构建阶段复制 node_modules（仅生产依赖）
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

# 设置用户
USER nextjs

# 暴露端口
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动（使用 next start）
CMD ["npm", "run", "start"]

