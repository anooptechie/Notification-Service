const { Queue } = require("bullmq");
const connection = require("./connection");

const notificationQueue = new Queue("notification-queue", {
  connection,

  defaultJobOptions: {
    attempts: 3, // retry automatically
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true, // keep Redis clean
    removeOnFail: false,    // keep failed jobs for DLQ inspection
  },
});

module.exports = notificationQueue;