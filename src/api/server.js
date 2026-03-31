require("dotenv").config();

const express = require("express");
const eventsRoute = require("./routes/eventsRoute");

const logger = require("../utils/logger");
const { register } = require("../utils/metrics");

const app = express();

// ✅ Only load Bull Board in non-test environment
if (process.env.NODE_ENV !== "test") {
  const bullBoard = require("./bullBoard");
  app.use("/admin/queues", bullBoard.getRouter());
}

// Middleware
app.use(express.json());

// Routes
app.use("/events", eventsRoute);

// Metrics endpoint (Prometheus)
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (err) {
    logger.error({
      msg: "Failed to fetch metrics",
      error: err.message,
    });
    res.status(500).end();
  }
});

// Start server ONLY if not in test
const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info({
      msg: "API started",
      port: PORT,
    });
  });
}

// ✅ IMPORTANT: export app for testing
module.exports = app;