const IORedis = require("ioredis");

let connection;

if (process.env.NODE_ENV === "test") {
  // 👇 Fake connection (prevents Redis errors)
  connection = {
    get: async () => null,
    set: async () => null,
  };
} else {
  connection = new IORedis({
    host: process.env.REDIS_HOST || "redis",
    port: 6379,
  });
}

module.exports = connection;