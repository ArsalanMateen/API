const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient = null;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          return null; // stop retrying if Redis is not available
        }
        return Math.min(times * 100, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on("error", (err) => {
      // log error softly so missing Redis does not crash the entire app
      console.warn("Redis connection warning:", err.message);
    });
  }
  return redisClient;
};

const pingRedis = async () => {
  try {
    const client = getRedisClient();
    if (client.status === "wait" || client.status === "close") {
      await client.connect();
    }
    const start = Date.now();
    const response = await client.ping();
    const latencyMs = Date.now() - start;
    return {
      status: "connected",
      ping: response,
      latencyMs,
    };
  } catch (err) {
    return {
      status: "disconnected",
      error: err.message,
    };
  }
};

module.exports = {
  getRedisClient,
  pingRedis,
};
