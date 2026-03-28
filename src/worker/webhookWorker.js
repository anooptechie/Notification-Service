require("dotenv").config();
const { Worker } = require("bullmq");
const connection = require("../queue/connection");

const worker = new Worker(
  "webhook-queue",
  async (job) => {
    console.log("🌐 Sending WEBHOOK:", job.data);
  },
  { connection }
);

console.log("🌐 Webhook worker started");