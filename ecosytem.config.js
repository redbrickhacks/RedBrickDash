require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'sso',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/opt/hibiscus/dist/apps/sso',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    },
    {
      name: 'dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4201',
      cwd: '/opt/hibiscus/dist/apps/dashboard',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    },
    {
      name: 'podium',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4202',
      cwd: '/opt/hibiscus/dist/apps/podium',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    },
    {
      name: 'podium-service',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4203',
      cwd: '/opt/hibiscus/dist/apps/podium-service',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    },
    {
      name: 'event-service',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 8080',
      cwd: '/opt/hibiscus/dist/apps/event-service-next',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    },
  ],
};
