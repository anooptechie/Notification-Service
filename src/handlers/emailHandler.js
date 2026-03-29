module.exports = async function sendEmail(data) {
  console.log(
    `📧 [Parent ${data.parentJobId}] Sending EMAIL:`,
    data
  );

  if (Math.random() < 0.5) {
    throw new Error("Email service failed");
  }

  console.log(`✅ [Parent ${data.parentJobId}] Email sent`);
};