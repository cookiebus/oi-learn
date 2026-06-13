# ============================
# 信奥学 - Docker 部署配置
# ============================

# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# 依赖安装
COPY package.json package-lock.json* ./
RUN npm ci --only=production --ignore-scripts 2>/dev/null || npm ci --ignore-scripts
RUN npm ci --only=dev 2>/dev/null || true

# Prisma 生成
COPY prisma ./prisma
RUN npx prisma generate

# 源码
COPY . .

# 构建
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制 standalone 产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
