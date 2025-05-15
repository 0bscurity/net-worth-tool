module.exports = {
  apps: [
    {
      name: "networth-backend",
      script: "./index.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        MONGO_URI: process.env.MONGO_URI,
        AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
        AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
      },
      watch: false,
    },
  ],
};
