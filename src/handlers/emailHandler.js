const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

// Transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Startup validation log
logger.info({
  msg: "Email service initialized",
  emailUser: process.env.EMAIL_USER || "NOT SET",
  hasPassword: !!process.env.EMAIL_PASS,
});

module.exports = async function sendEmail(data) {
  const { parentJobId, traceId, eventType } = data;

  logger.info({
    msg: "Sending email",
    parentJobId,
    traceId,
    eventType,
  });

  // Hard fail if credentials missing
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.error({
      msg: "Missing email credentials",
      traceId,
    });
    throw new Error("Email credentials missing in environment variables");
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // test mode
    subject: `Notification: ${eventType}`,
    text: `Payload: ${JSON.stringify(data, null, 2)}`,
  };

  try {
    // Simulated failure (keep for testing retries)
    if (Math.random() < 0.3) {
      throw new Error("Simulated email failure");
    }

    await transporter.sendMail(mailOptions);

    logger.info({
      msg: "Email sent successfully",
      parentJobId,
      traceId,
    });

  } catch (err) {
    logger.error({
      msg: "Email sending failed",
      parentJobId,
      traceId,
      error: err.message,
    });

    throw err; // 🔥 critical for BullMQ retry
  }
};