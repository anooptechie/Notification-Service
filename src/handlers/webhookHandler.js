const axios = require("axios");

module.exports = async function sendWebhook(data) {
  console.log(`🌐 [Parent ${data.parentJobId}] Sending WEBHOOK`);

  const webhookUrl = "https://webhook.site/33038ccb-175b-4731-8f83-89bb37cce4d2";

  try {
    // optional simulated failure
    if (Math.random() < 0.3) {
      throw new Error("Simulated webhook failure");
    }

    await axios.post(webhookUrl, {
      eventType: data.eventType,
      payload: data,
    });

    console.log(`✅ [Parent ${data.parentJobId}] Webhook sent`);
  } catch (err) {
    console.error(
      `❌ [Parent ${data.parentJobId}] Webhook failed:`,
      err.message
    );
    throw err;
  }
};