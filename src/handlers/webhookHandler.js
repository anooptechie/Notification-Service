module.exports = async function sendWebhook(data) {
  console.log(
    `🌐 [Parent ${data.parentJobId}] Sending WEBHOOK:`,
    data
  );

  if (Math.random() < 0.5) {
    throw new Error("Webhook failed");
  }

  console.log(`✅ [Parent ${data.parentJobId}] Webhook sent`);
};