module.exports = {
  apps: [
    {
      name: "elneto_dev",
      script: "./index.js",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        ELNETO_ENV: 'dev'
      },
      cwd: '/usr/local/share/website/dev.elneto.com/elneto_dev'
    }
  ],
};
