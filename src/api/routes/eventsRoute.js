const express = require("express");
const notificationQueue = require("../../queue/queue");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const event = req.body;

    // (Phase 1: no validation yet)
    const job = await notificationQueue.add("send-notification", event);

    res.status(202).json({
      status: "accepted",
      jobId: job.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to enqueue event" });
  }
});

module.exports = router;