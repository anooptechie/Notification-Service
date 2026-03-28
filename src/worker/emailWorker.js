require("dotenv").config();
const { Worker } = require("bullmq");
const connection = require("../queue/connection");

const worker = new Worker(
  "email-queue",
  async (job) => {
    console.log("📧 Sending EMAIL:", job.data);
  },
  { connection }
);

console.log("📧 Email worker started");