require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./openapi.json");

const { pool, ensureSchema } = require("./src/db");
const { pingRedis } = require("./src/redis");

const PostgresRepository = require("./src/repositories/postgresRepo");

const Service = require("./src/services/service");
const createRouter = require("./src/routes/routes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// dependency injection
const repository = new PostgresRepository(pool);

const service = new Service(repository);
const router = createRouter(service);

app.use(router);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "API",
    version: "1.0",
    endpoints: ["/tasks", "/tasks/:id", "/health", "/docs"],
  });
});

// health check
app.get("/health", async (req, res) => {
  let dbStatus = "connected";
  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL is connected.");
  } catch (err) {
    dbStatus = `disconnected: ${err.message}`;
    console.error(" PostgreSQL is unavailable:", err.message);
  }

  const redisStatus = await pingRedis();
  console.log('Redis status is', redisStatus.status);
  
  const isHealthy = dbStatus === "connected";
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    database: dbStatus,
    redis: redisStatus,
    timestamp: new Date().toISOString(),
  });
});

// global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled application error:", err);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// initialize database schema and start server
async function startServer() {
  try {
    await ensureSchema();
    console.log("Database initialized successfully.");
  } catch (err) {
    console.warn("Could not connect to database: ", err.message);
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
