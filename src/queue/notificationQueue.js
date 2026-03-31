const { Queue } = require("bullmq");

// 🔥 Prevent BullMQ from running in test environment
if (process.env.NODE_ENV === "test") {
  module.exports = {
    add: async () => ({ id: "test-job-id" }),
  };
  return;
}

const connection = require("./connection");

const notificationQueue = new Queue("notification-queue", {
  connection,

  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

module.exports = notificationQueue;