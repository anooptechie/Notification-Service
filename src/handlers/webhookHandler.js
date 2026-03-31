const axios = require("axios");
const logger = require("../utils/logger");

const webhookUrl = process.env.WEBHOOK_URL ||
  "https://webhook.site/33038ccb-175b-4731-8f83-89bb37cce4d2";

module.exports = async function sendWebhook(data) {
  const { parentJobId, traceId, eventType } = data;

  logger.info({
    msg: "Sending webhook",
    parentJobId,
    traceId,
    eventType,
    webhookUrl,
  });

  try {
    // Simulated failure
    if (Math.random() < 0.3) {
      throw new Error("Simulated webhook failure");
    }

    const response = await axios.post(
      webhookUrl,
      {
        eventType,
        payload: data,
      },
      {
        timeout: 5000, // 🔥 important
      }
    );

    logger.info({
      msg: "Webhook sent successfully",
      parentJobId,
      traceId,
      status: response.status,
    });

  } catch (err) {
    logger.error({
      msg: "Webhook failed",
      parentJobId,
      traceId,
      error: err.message,
    });

    throw err;
  }
};