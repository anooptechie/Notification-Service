require("dotenv").config();
const { Worker } = require("bullmq");
const connection = require("../queue/connection");

const sendEmail = require("../handlers/emailHandler");
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
      msg: "Failed to fetch email worker metrics",
      error: err.message,
    });
    res.status(500).end();
  }
});

const METRICS_PORT = process.env.EMAIL_WORKER_METRICS_PORT || 4001;

app.listen(METRICS_PORT, () => {
  logger.info({
    msg: "Email worker metrics server started",
    port: METRICS_PORT,
  });
});

// Worker
const worker = new Worker(
  "email-queue",
  async (job) => {
    const { traceId, parentJobId } = job.data;

    logger.info({
      msg: "Processing email job",
      jobId: job.id,
      parentJobId,
      traceId,
    });

    await sendEmail(job.data);
  },
  { connection }
);

// Success
worker.on("completed", (job) => {
  jobsProcessed.inc({ queue: "email" });

  logger.info({
    msg: "Email job completed",
    jobId: job.id,
    parentJobId: job.data.parentJobId,
    traceId: job.data.traceId,
  });
});

// Failure
worker.on("failed", (job, err) => {
  jobsFailed.inc({ queue: "email" });

  logger.error({
    msg: "Email job failed",
    jobId: job.id,
    parentJobId: job.data.parentJobId,
    traceId: job.data.traceId,
    error: err.message,
  });
});

logger.info({ msg: "Email worker started" });