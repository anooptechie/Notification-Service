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

console.log("🌐 Webhook worker started");
