require("dotenv").config();
const { Worker } = require("bullmq");
const connection = require("../queue/connection");

const sendEmail = require("../handlers/emailHandler");

const worker = new Worker(
  "email-queue",
  async (job) => {
    await sendEmail(job.data);
  },
  { connection },
);

worker.on("failed", (job, err) => {
  console.error(`❌ Email job ${job.id} failed:`, err.message);
});

console.log("📧 Email worker started");
