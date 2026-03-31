require("dotenv").config();
const { Worker } = require("bullmq");
const connection = require("../queue/connection");

const sendWebhook = require("../handlers/webhookHandler");
const logger = require("../utils/logger");
const { jobsProcessed, jobsFailed, register } = require("../utils/metrics");

const express = require("express");
const app = express();

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    logger.error({
      msg: "Failed to fetch webhook worker metrics",
      error: err.message,
    });
    res.status(500).end();
  }
});

const METRICS_PORT = process.env.WEBHOOK_WORKER_METRICS_PORT || 4002;

app.listen(METRICS_PORT, () => {
  logger.info({
    msg: "Webhook worker metrics server started",
    port: METRICS_PORT,
  });
});

// Worker
const worker = new Worker(
  "webhook-queue",
  async (job) => {
    const { traceId, parentJobId } = job.data;

    logger.info({
      msg: "Processing webhook job",
      jobId: job.id,
      parentJobId,
      traceId,
    });

    await sendWebhook(job.data);
  },
  { connection }
);

// Success
worker.on("completed", (job) => {
  jobsProcessed.inc({ queue: "webhook" });

  logger.info({
    msg: "Webhook job completed",
    jobId: job.id,
    parentJobId: job.data.parentJobId,
    traceId: job.data.traceId,
  });
});

// Failure
worker.on("failed", (job, err) => {
  jobsFailed.inc({ queue: "webhook" });

  logger.error({
    msg: "Webhook job failed",
    jobId: job.id,
    parentJobId: job.data.parentJobId,
    traceId: job.data.traceId,
    error: err.message,
  });
});

logger.info({ msg: "Webhook worker started" });