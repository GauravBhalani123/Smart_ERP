import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER;
const emailPassRaw = process.env.EMAIL_PASS;
const emailPass = (emailPassRaw || "").replace(/\s+/g, "");

let transporter = null;
if (emailUser && emailPass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

export async function sendEmail({ to, subject, text, html, attachments = [] }) {
  if (!transporter) {
    console.log("Email skipped: No transporter configured");
    return { skipped: true, reason: "Email credentials not configured" };
  }
  try {
    console.log(`Attempting to send email to: ${to}`);
    const info = await transporter.sendMail({
      from: `"Yamuna Poly Plast" <${emailUser}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });
    console.log("Email sent successfully. Response:", info.response);
    return {
      skipped: false,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    };
  } catch (error) {
    console.error("Nodemailer Error:", error);
    return { skipped: false, error: error?.message || "Email send failed" };
  }
}

export async function verifyEmailTransport() {
  if (!transporter) return { ok: false, reason: "Email credentials not configured" };
  try {
    await transporter.verify();
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error?.message || "SMTP verify failed" };
  }
}
