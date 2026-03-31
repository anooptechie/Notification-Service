require("dotenv").config();
const { Worker } = require("bullmq");
const connection = require("../queue/connection");

const emailQueue = require("../queue/emailQueue");
const webhookQueue = require("../queue/webhookQueue");
const logger = require("../utils/logger");

const worker = new Worker(
  "notification-queue",
  async (job) => {
    const { channels = [], payload, traceId, type } = job.data;

    logger.info({
      msg: "Processing notification job",
      jobId: job.id,
      traceId,
      channels,
      eventType: type,
    });

    for (const channel of channels) {
      if (channel === "email") {
        await emailQueue.add(
          "send-email",
          {
            ...payload,
            parentJobId: job.id,
            eventType: type,
            traceId, // 🔥 propagate trace
          },
          {
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 1000,
            },
          }
        );

        logger.info({
          msg: "Email job created",
          parentJobId: job.id,
          traceId,
        });
      }

      if (channel === "webhook") {
        await webhookQueue.add(
          "send-webhook",
          {
            ...payload,
            parentJobId: job.id,
            eventType: type,
            traceId, // 🔥 propagate trace
          },
          {
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 1000,
            },
          }
        );

        logger.info({
          msg: "Webhook job created",
          parentJobId: job.id,
          traceId,
        });
      }
    }

    logger.info({
      msg: "Fan-out completed",
      jobId: job.id,
      traceId,
    });
  },
  { connection }
);

logger.info({ msg: "Notification (fan-out) worker started" });