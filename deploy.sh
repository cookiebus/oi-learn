#!/bin/bash
# ============================
# 信奥学 - 一键部署脚本
# ============================
# 适合：阿里云 Ubuntu 20.04+ / CentOS 7+
# 使用方法:
#   chmod +x deploy.sh
#   sudo ./deploy.sh
#
# 选项:
#   --docker    使用 Docker 部署（默认）
#   --bare      使用 PM2 裸机部署
#   --ssl       自动申请 Let's Encrypt SSL 证书
# ============================

set -e

# ---- 配置 ----
DOMAIN="${DOMAIN:-shencode.cn}"
APP_DIR="/opt/oilearn"
GIT_REPO=""  # 如果使用 Git 仓库，填这里

# ---- 颜色 ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ---- 检测系统 ----
detect_os() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
  else
    OS=$(uname -s)
  fi
  info "检测到系统: $OS"
}

# ---- 安装 Docker ----
install_docker() {
  if command -v docker &>/dev/null; then
    info "Docker 已安装"
  else
    info "安装 Docker..."
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
  fi

  if command -v docker compose &>/dev/null || docker compose version &>/dev/null; then
    info "Docker Compose 已安装"
  else
    info "安装 Docker Compose..."
    apt-get install -y docker-compose-plugin 2>/dev/null || \
      pip3 install docker-compose 2>/dev/null || \
      warn "请手动安装 Docker Compose"
  fi
}

# ---- 安装 Node.js（裸机部署用） ----
install_node() {
  if command -v node &>/dev/null && [[ $(node -v) =~ v20 ]]; then
    info "Node.js 20 已安装"
  else
    info "安装 Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  fi
}

# ---- 安装 PM2（裸机部署用） ----
install_pm2() {
  if command -v pm2 &>/dev/null; then
    info "PM2 已安装"
  else
    npm install -g pm2
  fi
}

# ---- 申请 SSL 证书 ----
setup_ssl() {
  if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    info "SSL 证书已存在"
  else
    info "申请 Let's Encrypt SSL 证书..."
    apt-get install -y certbot
    certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN"

    # 复制证书到 nginx 目录
    mkdir -p "$APP_DIR/ssl"
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem "$APP_DIR/ssl/"
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem "$APP_DIR/ssl/"

    # 设置自动续期
    echo "0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $APP_DIR/ssl/ && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $APP_DIR/ssl/ && docker compose -f $APP_DIR/docker-compose.yml restart nginx" | crontab -
    info "SSL 证书已配置，自动续期已设置"
  fi
}

# ---- 获取代码 ----
get_code() {
  mkdir -p "$APP_DIR"

  if [ -n "$GIT_REPO" ]; then
    if [ -d "$APP_DIR/.git" ]; then
      info "更新代码..."
      cd "$APP_DIR" && git pull
    else
      info "克隆代码..."
      git clone "$GIT_REPO" "$APP_DIR"
    fi
  else
    # 从当前目录复制
    if [ -f "docker-compose.yml" ]; then
      info "复制本地代码到 $APP_DIR..."
      rsync -av --exclude=node_modules --exclude=.next --exclude=.git --exclude=dev.db ./ "$APP_DIR/"
    else
      error "请在项目目录下运行此脚本，或设置 GIT_REPO"
    fi
  fi
}

# ---- Docker 部署 ----
deploy_docker() {
  info "===== Docker 部署 ====="

  cd "$APP_DIR"

  # 创建环境变量文件
  if [ ! -f ".env" ]; then
    cp .env.production .env 2>/dev/null || true
    warn "请编辑 $APP_DIR/.env 填入实际配置"
    warn "至少需要修改: AUTH_SECRET, AI_API_KEY"
    read -p "按回车继续..."
  fi

  # 设置 SSL
  if [ ! -f "ssl/fullchain.pem" ]; then
    mkdir -p ssl
    # 尝试从 certbot 复制
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
      cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/
      cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/
    else
      # 生成自签名证书（便于测试）
      warn "未找到 SSL 证书，生成自签名证书..."
      openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/privkey.pem -out ssl/fullchain.pem \
        -subj "/CN=$DOMAIN"
    fi
  fi

  # 启动服务
  info "拉取镜像并启动..."
  docker compose pull
  docker compose up -d --build

  # 数据库迁移
  info "运行数据库迁移..."
  sleep 5
  docker compose exec -T app npx prisma db push --accept-data-loss 2>/dev/null || \
    docker compose exec -T app npx prisma db push

  # 种子数据
  info "初始化种子数据..."
  docker compose exec -T app npx tsx prisma/seed.ts 2>/dev/null || true

  info "✅ Docker 部署完成！"
  info "访问: https://$DOMAIN"
  info "查看日志: docker compose logs -f"
}

# ---- 裸机部署 ----
deploy_bare() {
  info "===== 裸机部署 ====="

  cd "$APP_DIR"

  # 安装 PostgreSQL
  if ! command -v psql &>/dev/null; then
    info "安装 PostgreSQL..."
    apt-get install -y postgresql postgresql-client
    systemctl enable postgresql
    systemctl start postgresql
  fi

  # 创建数据库
  info "创建数据库..."
  sudo -u postgres psql -c "CREATE USER oilearn WITH PASSWORD 'oilearn123';" 2>/dev/null || true
  sudo -u postgres psql -c "CREATE DATABASE oilearn OWNER oilearn;" 2>/dev/null || true

  # 安装依赖
  info "安装项目依赖..."
  npm install
  npx prisma generate

  # 数据库迁移
  info "运行数据库迁移..."
  npx prisma db push

  # 种子数据
  info "初始化种子数据..."
  npx tsx prisma/seed.ts

  # 构建
  info "构建项目..."
  npm run build

  # 启动 PM2
  info "启动 PM2..."
  pm2 start ecosystem.config.js --env production
  pm2 save

  # 配置 Nginx
  info "配置 Nginx..."
  apt-get install -y nginx
  cp nginx.conf /etc/nginx/sites-available/oilearn
  ln -sf /etc/nginx/sites-available/oilearn /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl restart nginx

  info "✅ 裸机部署完成！"
  info "访问: http://$DOMAIN"
  info "管理 PM2: pm2 list | pm2 logs"
}

# ---- 主流程 ----
main() {
  # 检查 root 权限
  if [[ $EUID -ne 0 ]]; then
    error "请使用 sudo 运行: sudo ./deploy.sh"
  fi

  detect_os

  # 解析参数
  MODE="docker"
  WITH_SSL=false

  for arg in "$@"; do
    case "$arg" in
      --docker) MODE="docker" ;;
      --bare)   MODE="bare" ;;
      --ssl)    WITH_SSL=true ;;
      --help)
        echo "使用方法: sudo ./deploy.sh [选项]"
        echo "  --docker     使用 Docker 部署（默认）"
        echo "  --bare       使用 PM2 裸机部署"
        echo "  --ssl        自动申请 SSL 证书"
        echo "  --help       查看帮助"
        exit 0
        ;;
    esac
  done

  get_code

  if [[ "$MODE" == "docker" ]]; then
    install_docker
    setup_ssl
    deploy_docker
  else
    install_node
    install_pm2
    setup_ssl
    deploy_bare
  fi

  # 防火墙
  info "配置防火墙..."
  if command -v ufw &>/dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable 2>/dev/null || true
  fi

  echo ""
  info "======================================"
  info "  🎉 部署完成！"
  info "  域名: https://$DOMAIN"
  info "  日志: docker compose logs -f"
  info "======================================"
}

main "$@"
