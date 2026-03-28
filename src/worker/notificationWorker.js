require("dotenv").config();
const { Worker } = require("bullmq");
const connection = require("../queue/connection");

const emailQueue = require("../queue/emailQueue");
const webhookQueue = require("../queue/webhookQueue");

const worker = new Worker(
  "notification-queue",
  async (job) => {
    console.log("📩 Parent job received:", job.id);

    const { channels = [], payload } = job.data;

    for (const channel of channels) {
      if (channel === "email") {
        await emailQueue.add("send-email", payload);
        console.log("➡️ Added EMAIL job");
      }

      if (channel === "webhook") {
        await webhookQueue.add("send-webhook", payload);
        console.log("➡️ Added WEBHOOK job");
      }
    }

    console.log("🔀 Fan-out completed for job:", job.id);
  },
  { connection },
);

console.log("🚀 Notification (fan-out) worker started");
