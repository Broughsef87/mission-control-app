// PM2 ecosystem config for the Foundry.
// Secrets live in .env.local (Next.js auto-loads them when cwd is the Foundry root).
// Do NOT add SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, or any other secret here.

module.exports = {
  apps: [{
    name: 'foundry',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: __dirname,
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    watch: false,
    autorestart: true,
    max_restarts: 5,
    restart_delay: 5000,
    max_memory_restart: '512M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
};
