const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const { Student, Batch, Contact, Admin } = require('../models');
const { isAdmin, isGuest } = require('../middleware/auth');

// ─── LOGIN ────────────────────────────────────────────────────
router.get('/login', isGuest, (req, res) => {
  res.render('admin/login', {
    title: 'Admin Login — Akram Biology',
    error: req.flash('error')
  });
});

router.post('/login', isGuest, async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/admin/login');
    }
    req.session.isAdmin   = true;
    req.session.adminName = admin.username;
    res.redirect('/admin/dashboard');
  } catch (err) {
    req.flash('error', 'Login error. Try again.');
    res.redirect('/admin/login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// ─── DASHBOARD ────────────────────────────────────────────────
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const [totalStudents, pending, confirmed, batches, unreadMessages] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'pending' }),
      Student.countDocuments({ status: 'confirmed' }),
      Batch.find({ isActive: true }).lean(),
      Contact.countDocuments({ isRead: false })
    ]);
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5).lean();
    res.render('admin/dashboard', {
      page: 'dashboard',
      title: 'Dashboard — Akram Biology Admin',
      adminName: req.session.adminName,
      stats: { totalStudents, pending, confirmed, unreadMessages },
      batches,
      recentStudents,
      success: req.flash('success'),
      error:   req.flash('error')
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin/login');
  }
});

// ─── STUDENTS LIST ────────────────────────────────────────────
router.get('/students', isAdmin, async (req, res) => {
  try {
    const { status, className, search } = req.query;
    let filter = {};
    if (status)    filter.status    = status;
    if (className) filter.className = className;
    if (search)    filter.$or = [
      { studentName: new RegExp(search, 'i') },
      { phone:       new RegExp(search, 'i') }
    ];
    const students = await Student.find(filter).sort({ createdAt: -1 }).lean();
    res.render('admin/students', {
      page: 'students',
      title: 'Students — Akram Biology Admin',
      adminName: req.session.adminName,
      students,
      filter: { status, className, search },
      success: req.flash('success'),
      error:   req.flash('error')
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin/dashboard');
  }
});

// ─── STUDENT DETAIL ───────────────────────────────────────────
router.get('/students/:id', isAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('batch').lean();
    if (!student) { req.flash('error', 'Student not found'); return res.redirect('/admin/students'); }
    const batches = await Batch.find({ isActive: true }).lean();
    res.render('admin/student-detail', {
      page: 'students',
      title: `${student.studentName} — Admin`,
      adminName: req.session.adminName,
      student, batches,
      success: req.flash('success'),
      error:   req.flash('error')
    });
  } catch (err) {
    res.redirect('/admin/students');
  }
});

// ─── UPDATE STUDENT STATUS ────────────────────────────────────
router.post('/students/:id/status', isAdmin, async (req, res) => {
  try {
    const { status, feeStatus, notes } = req.body;
    const update = {};
    if (status)    { update.status    = status; if (status === 'confirmed') update.confirmedAt = new Date(); }
    if (feeStatus) update.feeStatus = feeStatus;
    if (notes !== undefined) update.notes = notes;
    await Student.findByIdAndUpdate(req.params.id, update);
    req.flash('success', 'Student updated successfully');
    res.redirect(`/admin/students/${req.params.id}`);
  } catch (err) {
    req.flash('error', 'Update failed');
    res.redirect('/admin/students');
  }
});

// ─── DELETE STUDENT ───────────────────────────────────────────
router.post('/students/:id/delete', isAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (student?.batch) await Batch.findByIdAndUpdate(student.batch, { $inc: { currentStudents: -1 } });
    await Student.findByIdAndDelete(req.params.id);
    req.flash('success', 'Student removed');
    res.redirect('/admin/students');
  } catch (err) {
    req.flash('error', 'Delete failed');
    res.redirect('/admin/students');
  }
});

// ─── BATCHES ──────────────────────────────────────────────────
router.get('/batches', isAdmin, async (req, res) => {
  try {
    const batches = await Batch.find().lean();
    res.render('admin/batches', {
      page: 'batches',
      title: 'Batches — Akram Biology Admin',
      adminName: req.session.adminName,
      batches,
      success: req.flash('success'),
      error:   req.flash('error')
    });
  } catch (err) { res.redirect('/admin/dashboard'); }
});

router.post('/batches/add', isAdmin, async (req, res) => {
  try {
    const { name, className, days, time, fee, maxStudents, description } = req.body;
    await Batch.create({
      name, className,
      days: Array.isArray(days) ? days : [days],
      time, fee: Number(fee) || 0,
      maxStudents: Number(maxStudents) || 15,
      description
    });
    req.flash('success', 'Batch added!');
    res.redirect('/admin/batches');
  } catch (err) {
    req.flash('error', 'Could not add batch');
    res.redirect('/admin/batches');
  }
});

router.post('/batches/:id/toggle', isAdmin, async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (batch) { batch.isActive = !batch.isActive; await batch.save(); }
  req.flash('success', 'Batch status updated');
  res.redirect('/admin/batches');
});

router.post('/batches/:id/delete', isAdmin, async (req, res) => {
  await Batch.findByIdAndDelete(req.params.id);
  req.flash('success', 'Batch deleted');
  res.redirect('/admin/batches');
});

// ─── MESSAGES ─────────────────────────────────────────────────
router.get('/messages', isAdmin, async (req, res) => {
  const messages = await Contact.find().sort({ createdAt: -1 }).lean();
  await Contact.updateMany({ isRead: false }, { isRead: true });
  res.render('admin/messages', {
      page: 'messages',
    title: 'Messages — Admin',
    adminName: req.session.adminName,
    messages,
    success: req.flash('success')
  });
});

router.post('/messages/:id/delete', isAdmin, async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  req.flash('success', 'Message deleted');
  res.redirect('/admin/messages');
});

module.exports = router;
