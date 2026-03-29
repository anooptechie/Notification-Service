const express = require("express");
const router = express.Router();

const notificationQueue = require("../../queue/queue");
const connection = require("../../queue/connection");

// Redis client (same connection used by BullMQ)
const redis = connection;

router.post("/", async (req, res) => {
  try {
    const event = req.body;
    const idempotencyKey = req.headers["idempotency-key"];

    if (!idempotencyKey) {
      return res.status(400).json({
        error: "Idempotency-Key header required",
      });
    }

    // Check duplicate
    const exists = await redis.get(idempotencyKey);

    if (exists) {
      return res.status(200).json({
        status: "duplicate",
        message: "Request already processed",
      });
    }

    // Add job
    const job = await notificationQueue.add("send-notification", event);

    // Store key with TTL (recommended)
    await redis.set(idempotencyKey, "processed", "EX", 3600);

    return res.status(202).json({
      status: "accepted",
      jobId: job.id,
    });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      error: "Failed to enqueue event",
    });
  }
});

module.exports = router;