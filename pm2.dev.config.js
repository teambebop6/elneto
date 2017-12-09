module.exports = {
  apps: [
    {
      name: "elneto_dev",
      script: "./app.js",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        DB_NAME: 'imhof_dev',
      },
      cwd: '/usr/local/share/website/dev.elneto.com/elneto_dev'
    }
  ],
};
