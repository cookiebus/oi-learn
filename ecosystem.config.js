// PM2 进程管理配置
// 裸机部署时使用
// 启动: pm2 start ecosystem.config.js --env production

module.exports = {
  apps: [
    {
      name: "oi-learn",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: __dirname,
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        DATABASE_URL: "postgresql://oilearn:oilearn123@localhost:5432/oilearn",
        AUTH_URL: "https://shencode.cn",
      },
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      merge_logs: true,
    },
  ],
};
