require("dotenv").config();
const { Worker } = require("bullmq");
const connection = require("../queue/connection");

const sendWebhook = require("../handlers/webhookHandler");

const worker = new Worker(
  "webhook-queue",
  async (job) => {
    await sendWebhook(job.data);
  },
  { connection },
);

worker.on("failed", (job, err) => {
  console.error(`❌ Webhook job ${job.id} failed:`, err.message);
});

console.log("🌐 Webhook worker started");
