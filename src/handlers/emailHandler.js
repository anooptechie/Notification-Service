module.exports = async function sendEmail(data) {
  console.log("📧 Sending EMAIL:", data);

  // Future:
  // integrate nodemailer / SES / etc.
  // Simulate failure randomly
  if (Math.random() < 0.5) {
    throw new Error("Email service failed");
  }

  console.log("✅ Email sent successfully");
};
