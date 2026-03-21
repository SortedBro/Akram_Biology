const { Resend } = require('resend');

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM || 'Akram Biology <onboarding@resend.dev>';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

// ── Enrollment confirmation to student ───────────────────────
async function sendEnrollmentConfirmation(student) {
  if (!process.env.RESEND_API_KEY || !student.email) return;
  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to: student.email,
      subject: '🌱 Enrollment Received — Akram Biology',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0b1f0e;color:#e2f5e8;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#166534,#22c55e);padding:32px;text-align:center">
            <h1 style="margin:0;font-size:1.8rem;color:#fff">🧬 Akram Biology</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Enrollment Confirmation</p>
          </div>
          <div style="padding:32px">
            <p>Dear <strong>${student.studentName}</strong>,</p>
            <p style="margin-top:12px">Thank you for enrolling at <strong>Akram Biology Tuition</strong>! Your request has been received.</p>
            <div style="background:#102616;border:1px solid rgba(74,222,128,0.2);border-radius:12px;padding:20px;margin:20px 0">
              <p style="margin:0 0 8px">📚 <strong>Class:</strong> ${student.className}</p>
              <p style="margin:0 0 8px">📋 <strong>Batch:</strong> ${student.batchName || 'To be confirmed'}</p>
              <p style="margin:0">📞 <strong>Next Step:</strong> Akram Sir will call you within 24 hours</p>
            </div>
            <p>WhatsApp: <strong>+91 ${process.env.WHATSAPP_NUMBER || '98765 43210'}</strong></p>
            <p style="color:#6b9e79;font-size:0.85rem;margin-top:24px">Akram Biology Tuition · English Bazar, Malda, West Bengal</p>
          </div>
        </div>`
    });
    console.log(`📧 Enrollment email sent to ${student.email}`);
  } catch (err) {
    console.error('Resend enrollment error:', err.message);
  }
}

// ── Admin notification on new enrollment ─────────────────────
async function sendAdminNotification(student) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) return;
  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `🆕 New Enrollment: ${student.studentName} (${student.className})`,
      html: `
        <h2>New Enrollment Request</h2>
        <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif">
          <tr><td style="padding:8px;font-weight:bold">Name</td><td style="padding:8px">${student.studentName}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Parent</td><td style="padding:8px">${student.parentName || '-'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px">${student.phone}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Class</td><td style="padding:8px">${student.className}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Batch</td><td style="padding:8px">${student.batchName || '-'}</td></tr>
        </table>
        <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/students">View in Admin Panel →</a></p>`
    });
  } catch (err) {
    console.error('Resend admin notify error:', err.message);
  }
}

// ── Fee payment confirmation to student ──────────────────────
async function sendFeeConfirmation(student, feeRecord) {
  if (!process.env.RESEND_API_KEY || !student.email) return;
  try {
    const resend = getResend();
    const monthName = MONTHS[feeRecord.month];
    await resend.emails.send({
      from: FROM,
      to: student.email,
      subject: `✅ Fee Payment Confirmed — ${monthName} ${feeRecord.year} | Akram Biology`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0b1f0e;color:#e2f5e8;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#166534,#22c55e);padding:32px;text-align:center">
            <h1 style="margin:0;font-size:1.8rem;color:#fff">🧬 Akram Biology</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Fee Payment Receipt</p>
          </div>
          <div style="padding:32px">
            <p>Dear <strong>${student.studentName}</strong>,</p>
            <p style="margin-top:12px">Your fee payment has been <strong style="color:#4ade80">successfully recorded</strong>. Thank you!</p>
            <div style="background:#102616;border:1px solid rgba(74,222,128,0.2);border-radius:12px;padding:20px;margin:20px 0">
              <p style="margin:0 0 10px;font-size:1.1rem;font-weight:bold;color:#4ade80">Payment Details</p>
              <p style="margin:0 0 8px">📅 <strong>Month:</strong> ${monthName} ${feeRecord.year}</p>
              <p style="margin:0 0 8px">💰 <strong>Amount:</strong> ₹${feeRecord.amount}</p>
              <p style="margin:0 0 8px">✅ <strong>Status:</strong> ${feeRecord.status.toUpperCase()}</p>
              <p style="margin:0">🕐 <strong>Recorded On:</strong> ${new Date(feeRecord.paidAt || Date.now()).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</p>
            </div>
            ${feeRecord.note ? `<p style="color:#86efac;font-style:italic">Note: ${feeRecord.note}</p>` : ''}
            <p style="color:#6b9e79;font-size:0.85rem;margin-top:24px">
              Keep this email as your payment receipt.<br>
              Akram Biology Tuition · English Bazar, Malda, West Bengal
            </p>
          </div>
        </div>`
    });
    console.log(`📧 Fee confirmation email sent to ${student.email}`);
  } catch (err) {
    console.error('Resend fee email error:', err.message);
  }
}

module.exports = { sendEnrollmentConfirmation, sendAdminNotification, sendFeeConfirmation };
