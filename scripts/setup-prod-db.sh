#!/bin/bash
# ============================
# 生产数据库迁移脚本
# ============================
# 在首次部署或数据库结构变更时运行

set -e

echo "======================================"
echo "  信奥学 - 数据库迁移"
echo "======================================"

# 1. 生成 Prisma Client
echo "[1/3] 生成 Prisma Client..."
npx prisma generate

# 2. 推送 Schema 到数据库
echo "[2/3] 同步数据库结构..."
npx prisma db push

# 3. 种子数据（仅首次）
if [ "$1" == "--seed" ]; then
  echo "[3/3] 初始化种子数据..."
  npx tsx prisma/seed.ts
fi

echo ""
echo "✅ 数据库迁移完成！"
echo ""
echo "后续管理:"
echo "  npx prisma studio     # 数据管理界面"
echo "  npx prisma db push    # 同步 Schema 变更"
