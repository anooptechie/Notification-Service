require("dotenv").config();
const { Queue } = require("bullmq");
const connection = require("../queue/connection");

const emailQueue = new Queue("email-queue", { connection });
const webhookQueue = new Queue("webhook-queue", { connection });

/**
 * 🔍 Inspect failed jobs (DLQ)
 */
async function inspectDLQ() {
  console.log("\n🔍 Inspecting DLQ...\n");

  const emailFailed = await emailQueue.getFailed();
  const webhookFailed = await webhookQueue.getFailed();

  console.log("📧 Email Failed Jobs:");
  if (emailFailed.length === 0) {
    console.log("✔ No failed email jobs");
  } else {
    emailFailed.forEach((job) => {
      console.log(`- Job ${job.id}:`, job.data);
    });
  }

  console.log("\n🌐 Webhook Failed Jobs:");
  if (webhookFailed.length === 0) {
    console.log("✔ No failed webhook jobs");
  } else {
    webhookFailed.forEach((job) => {
      console.log(`- Job ${job.id}:`, job.data);
    });
  }
}

/**
 * 🔁 Retry all failed jobs (Email + Webhook)
 */
async function retryAllFailedJobs() {
  console.log("\n🔁 Retrying ALL failed jobs...\n");

  const emailFailed = await emailQueue.getFailed();
  const webhookFailed = await webhookQueue.getFailed();

  for (const job of emailFailed) {
    console.log(`📧 Retrying Email Job ${job.id}`);
    await job.retry();
  }

  for (const job of webhookFailed) {
    console.log(`🌐 Retrying Webhook Job ${job.id}`);
    await job.retry();
  }

  console.log("\n✅ Retry triggered for all failed jobs\n");
}

/**
 * 🎯 Control execution here
 */
(async () => {
  await inspectDLQ();

  // 👉 Uncomment when you want to retry
  await retryAllFailedJobs();
})();
