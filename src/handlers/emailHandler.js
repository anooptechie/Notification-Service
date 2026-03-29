const nodemailer = require("nodemailer");

// 🔍 Debug: check env at startup
console.log("📨 Email Config Check:", {
  user: process.env.EMAIL_USER || "NOT SET",
  pass: process.env.EMAIL_PASS ? "SET" : "NOT SET",
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async function sendEmail(data) {
  console.log(`📧 [Parent ${data.parentJobId}] Sending EMAIL`);

  // 🛑 Hard fail if credentials missing
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials missing in environment variables");
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // send to yourself for testing
    subject: `Notification: ${data.eventType}`,
    text: `Payload: ${JSON.stringify(data, null, 2)}`,
  };

  try {
    // optional simulated failure (keep for retry testing)
    if (Math.random() < 0.3) {
      throw new Error("Simulated email failure");
    }

    await transporter.sendMail(mailOptions);

    console.log(`✅ [Parent ${data.parentJobId}] Email sent`);
  } catch (err) {
    console.error(
      `❌ [Parent ${data.parentJobId}] Email failed:`,
      err.message
    );
    throw err; // IMPORTANT: rethrow for BullMQ retry
  }
};