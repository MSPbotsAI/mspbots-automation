module.exports = {
  apps: [
    {
      name: 'mspbots-automation',
      cwd: __dirname,
      script: 'cmd.exe',
      args: '/c pnpm run dev',
      interpreter: 'none',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
}