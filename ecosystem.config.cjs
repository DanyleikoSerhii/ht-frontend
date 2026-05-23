module.exports = {
  apps: [
    {
      name: 'ht-frontend',
      script: 'npx',
      args: 'serve dist --single --listen 8000 --no-clipboard --no-port-switching',
      cwd: '/services/ht-frontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      kill_timeout: 8000,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'production',
      },
      out_file: '/var/log/services/ht-frontend/out.log',
      error_file: '/var/log/services/ht-frontend/err.log',
      time: true,
      merge_logs: true,
    },
  ],
};
