const { Queue } = require("bullmq");
const connection = require("./connection");

const emailQueue = new Queue("email-queue", { connection });

module.exports = emailQueue;