const express = require("express");
const router = express.Router();

const notificationQueue = require("../../queue/notificationQueue");
const connection = require("../../queue/connection");
const { v4: uuidv4 } = require("uuid");
const logger = require("../../utils/logger");
const { eventSchema } = require("../validator/eventValidator");

// Redis client (same connection used by BullMQ)
const redis = connection;

router.post("/", async (req, res) => {
  const traceId = uuidv4(); // generate early for full trace coverage

  try {
    const idempotencyKey = req.headers["idempotency-key"];

    // 🔍 Validate request body
    const parseResult = eventSchema.safeParse(req.body);

    if (!parseResult.success) {
      logger.warn({
        msg: "Invalid request payload",
        traceId,
        errors: parseResult.error.errors,
      });

      return res.status(400).json({
        error: "Invalid request payload",
        details: parseResult.error.errors,
      });
    }

    const event = parseResult.data;

    logger.info({
      msg: "Incoming request",
      traceId,
      idempotencyKey,
      eventType: event.type,
    });

    if (!idempotencyKey) {
      logger.warn({
        msg: "Missing idempotency key",
        traceId,
      });

      return res.status(400).json({
        error: "Idempotency-Key header required",
      });
    }

    // Check duplicate
    const exists = await redis.get(idempotencyKey);

    if (exists) {
      logger.info({
        msg: "Duplicate request",
        traceId,
        idempotencyKey,
      });

      return res.status(200).json({
        status: "duplicate",
        message: "Request already processed",
      });
    }

    // Add job
    const job = await notificationQueue.add("send-notification", {
      ...event,
      traceId,
    });

    logger.info({
      msg: "Job enqueued",
      traceId,
      jobId: job.id,
    });

    // Store key with TTL
    await redis.set(idempotencyKey, "processed", "EX", 3600);

    return res.status(202).json({
      status: "accepted",
      jobId: job.id,
      traceId,
    });

  } catch (err) {
    logger.error({
      msg: "Failed to enqueue event",
      traceId,
      error: err.message,
    });

    return res.status(500).json({
      error: "Failed to enqueue event",
    });
  }
});

module.exports = router;