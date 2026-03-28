const { Queue } = require("bullmq");
const connection = require("./connection");

const webhookQueue = new Queue("webhook-queue", { connection });

module.exports = webhookQueue;