const express  = require('express');
const router   = express.Router();
const { Student, Batch, Contact } = require('../models');
const { sendEnrollmentConfirmation, sendAdminNotification } = require('../config/mailer');

// ─── HOME ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find({ isActive: true }).lean();
    res.render('home', {
      title: 'Akram Biology — Master Life Sciences',
      batches,
      success: req.flash('success'),
      error:   req.flash('error')
    });
  } catch (err) {
    console.error(err);
    res.render('home', { title: 'Akram Biology', batches: [], success: [], error: [] });
  }
});

// ─── ENROLL (GET) ─────────────────────────────────────────────
router.get('/enroll', async (req, res) => {
  const batches = await Batch.find({ isActive: true }).lean();
  res.render('enroll', {
    title: 'Enroll Now — Akram Biology',
    batches,
    success: req.flash('success'),
    error:   req.flash('error')
  });
});

// ─── ENROLL (POST) ────────────────────────────────────────────
router.post('/enroll', async (req, res) => {
  try {
    const { studentName, parentName, phone, email, className, batchId, message } = req.body;

    // Validation
    if (!studentName || !phone || !className) {
      req.flash('error', 'Name, phone and class are required.');
      return res.redirect('/enroll');
    }

    // Find batch
    let batchName = 'To be confirmed';
    if (batchId) {
      const batch = await Batch.findById(batchId);
      if (batch) {
        if (batch.isFull) {
          req.flash('error', 'This batch is full. Please choose another batch.');
          return res.redirect('/enroll');
        }
        batchName = batch.name;
        await Batch.findByIdAndUpdate(batchId, { $inc: { currentStudents: 1 } });
      }
    }

    // Save student
    const student = await Student.create({
      studentName: studentName.trim(),
      parentName: parentName?.trim(),
      phone: phone.trim(),
      email: email?.trim().toLowerCase(),
      className,
      batch: batchId || null,
      batchName,
      message: message?.trim(),
      status: 'pending'
    });

    // Send emails (non-blocking)
    sendEnrollmentConfirmation(student).catch(console.error);
    sendAdminNotification(student).catch(console.error);

    req.flash('success', `✅ Enrollment submitted! Akram Sir will call you within 24 hours on ${phone}.`);
    res.redirect('/enroll');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/enroll');
  }
});

// ─── CONTACT (POST) ───────────────────────────────────────────
router.post('/contact', async (req, res) => {
  try {
    const { name, phone, message } = req.body;
    if (!name || !phone || !message) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/#contact');
    }
    await Contact.create({ name: name.trim(), phone: phone.trim(), message: message.trim() });
    req.flash('success', 'Message sent! Akram Sir will reply shortly.');
    res.redirect('/#contact');
  } catch (err) {
    req.flash('error', 'Could not send message. Please try again.');
    res.redirect('/#contact');
  }
});

module.exports = router;
