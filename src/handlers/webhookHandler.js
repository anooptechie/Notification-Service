module.exports = async function sendWebhook(data) {
  console.log("🌐 Sending WEBHOOK:", data);

  // Future:
  // axios.post(webhookUrl, data)
  if (Math.random() < 0.5) {
    throw new Error("Webhook failed");
  }

  console.log("✅ Webhook sent successfully");
};
