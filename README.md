# 🏆 信奥学 - 信奥自适应学习平台

> 从零开始学信奥，AI 因材施教，闯关解锁知识点

## 🚀 快速体验（本地开发）

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库并填充示例数据
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

# 3. 启动开发服务器
npm run dev
# 访问 http://localhost:3000
```

### 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@shencode.cn | admin123 |
| 学生 | student@test.com | 123456 |

## 🏗️ 技术栈

| 层次 | 技术 |
|------|------|
| 前端 | Next.js 16 + React 19 + Tailwind CSS 4 |
| UI 组件 | Radix UI + Lucide Icons |
| 数据库 | SQLite（开发）/ PostgreSQL（生产） |
| ORM | Prisma 5 |
| 认证 | NextAuth v5（JWT） |
| AI | DeepSeek / 通义千问 API |
| 视频 | 阿里云 VOD |
| OJ 对接 | wikioi.cn |

## 📁 项目结构

```
oi-learn/
├── prisma/                     # 数据库
│   ├── schema.prisma          # 数据模型
│   ├── seed.ts                # 种子数据
│   └── dev.db                 # SQLite（开发用）
├── src/
│   ├── app/
│   │   ├── page.tsx           # 首页
│   │   ├── layout.tsx         # 全局布局
│   │   ├── (auth)/            # 登录 / 注册
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── learn/             # 学生端
│   │   │   ├── page.tsx       # 知识图谱
│   │   │   └── [slug]/        # 知识点详情
│   │   ├── admin/             # 管理后台
│   │   │   ├── page.tsx       # 仪表盘
│   │   │   ├── points/        # 知识点管理
│   │   │   └── questions/     # 题目管理
│   │   └── api/               # API 路由
│   ├── components/
│   │   ├── ui/                # UI 组件
│   │   ├── knowledge-graph.tsx # 知识图谱
│   │   ├── video-player.tsx   # 视频播放器
│   │   ├── quiz.tsx           # 测验系统
│   │   └── ai-chat.tsx        # AI 助教
│   └── lib/
│       ├── auth.ts            # NextAuth 配置
│       ├── db.ts              # Prisma 客户端
│       ├── ai.ts              # AI 服务封装
│       └── utils.ts           # 工具函数
├── deploy.sh                  # 一键部署脚本
├── docker-compose.yml         # Docker 部署
├── Dockerfile                 # Docker 构建
├── nginx.conf                 # Nginx 反向代理
└── ecosystem.config.js        # PM2 配置
```

## ☁️ 部署到阿里云

### 方式一：Docker 部署（推荐）

```bash
# 1. 登录阿里云服务器
ssh root@your-server-ip

# 2. 安装 git 并拉取代码
apt install -y git
git clone https://github.com/your-org/oi-learn.git /opt/oilearn
cd /opt/oilearn

# 3. 配置环境变量
cp .env.production .env
# 编辑 .env，至少修改：
#   - AUTH_SECRET（用 openssl rand -base64 32 生成）
#   - AI_API_KEY（DeepSeek 或其他 LLM 的 API Key）

# 4. 一键部署
sudo DOMAIN=shencode.cn bash deploy.sh

# 5. 查看运行状态
docker compose ps
docker compose logs -f
```

**首次部署后还需执行：**
```bash
# 数据库迁移
docker compose exec app npx prisma db push
# 初始化种子数据
docker compose exec app npx tsx prisma/seed.ts
```

### 方式二：裸机部署（PM2）

```bash
sudo bash deploy.sh --bare
```

### 方式三：手动部署

```bash
# 1. 安装依赖
npm install
npx prisma generate

# 2. 配置 PostgreSQL 数据库
# 创建数据库 oilearn，修改 .env 中的 DATABASE_URL

# 3. 数据库迁移 + 种子数据
npx prisma db push
npx tsx prisma/seed.ts

# 4. 构建 + 启动
npm run build
pm2 start ecosystem.config.js --env production

# 5. 配置 Nginx 反向代理
cp nginx.conf /etc/nginx/sites-available/oilearn
# 修改域名、SSL 证书路径后启用
ln -s /etc/nginx/sites-available/oilearn /etc/nginx/sites-enabled/
systemctl restart nginx
```

### 🔐 SSL 证书

```bash
# 自动申请 Let's Encrypt 证书
certbot certonly --standalone -d shencode.cn -d www.shencode.cn

# 证书路径
# /etc/letsencrypt/live/shencode.cn/fullchain.pem
# /etc/letsencrypt/live/shencode.cn/privkey.pem

# 复制到 nginx 配置目录
mkdir -p /opt/oilearn/ssl
cp /etc/letsencrypt/live/shencode.cn/*.pem /opt/oilearn/ssl/

# 设置自动续期（已包含在 deploy.sh 中）
crontab -e
# 添加: 0 3 * * * certbot renew --quiet && docker compose -f /opt/oilearn/docker-compose.yml restart nginx
```

## 🧪 API 接口

| 路径 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/auth/register` | POST | 注册 | - |
| `/api/auth/[...nextauth]` | * | NextAuth 认证 | - |
| `/api/points` | GET/POST/PUT | 知识点 CRUD | ADMIN |
| `/api/questions` | GET/POST/PUT | 题目 CRUD | ADMIN |
| `/api/progress` | GET/POST | 学习进度 | STUDENT |
| `/api/quiz` | POST | 提交测验 | STUDENT |
| `/api/ai/chat` | POST | AI 问答 | STUDENT |

## 📦 数据模型

- **User** - 用户（学生/教师/管理员）
- **KnowledgePoint** - 知识点
- **Prerequisite** - 前置依赖（DAG）
- **Question** - 测试题（选择题/代码题）
- **StudentProgress** - 学习进度（LOCKED → UNLOCKED → LEARNING → COMPLETED）
- **UserAnswer** - 答题记录

## 🎯 核心功能

### 知识图谱（DAG）
每个知识点可以有多个前置依赖，所有前置完成后自动解锁。

### 闯关解锁
- 知识点状态：🔒 未解锁 → 🔓 已解锁 → 📖 学习中 → ✅ 已完成
- 测试 60% 正确率通过，解锁后续知识点

### AI 助教
基于 DeepSeek / 通义千问 API，根据当前知识点上下文回答问题。

### OJ 对接
代码题可对接 wikioi.cn 判题系统，复用已有题库。

## 🔧 日常维护

```bash
# 查看日志
docker compose logs -f app

# 数据库管理界面
npx prisma studio

# 备份数据库（PostgreSQL）
pg_dump -U oilearn oilearn > backup_$(date +%Y%m%d).sql

# 更新代码
git pull
docker compose up -d --build app
docker compose exec app npx prisma db push
```

## 📄 许可

© 2024 杭州深搜教育科技有限公司. All rights reserved.
