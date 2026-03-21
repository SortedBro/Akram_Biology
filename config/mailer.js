const nodemailer = require('nodemailer');

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// Send confirmation to student
async function sendEnrollmentConfirmation(student) {
  if (!process.env.EMAIL_USER || !student.email) return;
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Akram Biology" <${process.env.EMAIL_USER}>`,
      to: student.email,
      subject: '🌱 Enrollment Received — Akram Biology Tuition',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0b1f0e;color:#e2f5e8;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#166534,#22c55e);padding:32px;text-align:center">
            <h1 style="margin:0;font-size:1.8rem;color:#fff">🧬 Akram Biology</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Enrollment Confirmation</p>
          </div>
          <div style="padding:32px">
            <p>Dear <strong>${student.studentName}</strong>,</p>
            <p>Thank you for enrolling at <strong>Akram Biology Tuition</strong>! Your enrollment request has been received.</p>
            <div style="background:#102616;border:1px solid rgba(74,222,128,0.2);border-radius:12px;padding:20px;margin:20px 0">
              <p style="margin:0 0 8px"><strong>📚 Class:</strong> ${student.className}</p>
              <p style="margin:0 0 8px"><strong>📋 Batch:</strong> ${student.batchName || 'To be confirmed'}</p>
              <p style="margin:0"><strong>📞 Contact:</strong> Akram Sir will call you within 24 hours</p>
            </div>
            <p>For immediate queries, WhatsApp us at <strong>+91 ${process.env.WHATSAPP_NUMBER || '98765 43210'}</strong></p>
            <p style="color:#6b9e79;font-size:0.85rem;margin-top:24px">Akram Biology Tuition · English Bazar, Malda, West Bengal</p>
          </div>
        </div>
      `
    });
    console.log(`📧 Email sent to ${student.email}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

// Send admin notification
async function sendAdminNotification(student) {
  if (!process.env.EMAIL_USER) return;
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Akram Biology System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `🆕 New Enrollment: ${student.studentName} (${student.className})`,
      html: `
        <h2>New Enrollment Request</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td><strong>Name</strong></td><td>${student.studentName}</td></tr>
          <tr><td><strong>Parent</strong></td><td>${student.parentName || '-'}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${student.phone}</td></tr>
          <tr><td><strong>Email</strong></td><td>${student.email || '-'}</td></tr>
          <tr><td><strong>Class</strong></td><td>${student.className}</td></tr>
          <tr><td><strong>Batch</strong></td><td>${student.batchName || 'Not selected'}</td></tr>
          <tr><td><strong>Message</strong></td><td>${student.message || '-'}</td></tr>
        </table>
        <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/students">View in Admin Panel →</a></p>
      `
    });
  } catch (err) {
    console.error('Admin email error:', err.message);
  }
}

module.exports = { sendEnrollmentConfirmation, sendAdminNotification };
