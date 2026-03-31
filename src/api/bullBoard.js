const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const notificationQueue = require("../queue/notificationQueue");
const emailQueue = require("../queue/emailQueue");
const webhookQueue = require("../queue/webhookQueue");

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(notificationQueue),
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(webhookQueue),
  ],
  serverAdapter,
});

module.exports = serverAdapter;