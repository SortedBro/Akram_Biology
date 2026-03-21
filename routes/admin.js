const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const { Student, Batch, Contact, Admin, FeeRecord } = require('../models');
const { isAdmin, isGuest } = require('../middleware/auth');
const { sendEnrollmentConfirmation, sendAdminNotification, sendFeeConfirmation } = require('../config/mailer');

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

// ─── LOGIN ────────────────────────────────────────────────────
router.get('/login', isGuest, (req, res) => {
  res.render('admin/login', { title: 'Admin Login — Akram Biology', error: req.flash('error') });
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
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear  = now.getFullYear();

    const [totalStudents, pending, confirmed, batches, unreadMessages,
           feePaidThisMonth, feeUnpaidThisMonth, totalCollectedThisMonth] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'pending' }),
      Student.countDocuments({ status: 'confirmed' }),
      Batch.find({ isActive: true }).lean(),
      Contact.countDocuments({ isRead: false }),
      FeeRecord.countDocuments({ month: thisMonth, year: thisYear, status: 'paid' }),
      FeeRecord.countDocuments({ month: thisMonth, year: thisYear, status: 'unpaid' }),
      FeeRecord.aggregate([
        { $match: { month: thisMonth, year: thisYear, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5).lean();
    const totalAmount = totalCollectedThisMonth[0]?.total || 0;

    res.render('admin/dashboard', {
      page: 'dashboard',
      title: 'Dashboard — Akram Biology Admin',
      adminName: req.session.adminName,
      stats: { totalStudents, pending, confirmed, unreadMessages,
               feePaidThisMonth, feeUnpaidThisMonth, totalAmount,
               currentMonth: MONTHS[thisMonth] },
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

    const batches    = await Batch.find({ isActive: true }).lean();
    const feeRecords = await FeeRecord.find({ student: student._id }).sort({ year: -1, month: -1 }).lean();

    // Build last 12 months grid
    const now = new Date();
    const last12 = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth(), y = d.getFullYear();
      const rec = feeRecords.find(r => r.month === m && r.year === y);
      last12.push({ month: m, year: y, monthName: MONTHS[m], record: rec || null });
    }

    res.render('admin/student-detail', {
      page: 'students',
      title: `${student.studentName} — Admin`,
      adminName: req.session.adminName,
      student, batches, feeRecords, last12, MONTHS,
      success: req.flash('success'),
      error:   req.flash('error')
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin/students');
  }
});

// ─── AUTO-CREATE MONTHLY FEE RECORDS ─────────────────────────
// Called when student is confirmed — creates unpaid record for
// current month + all future months up to 12 months ahead
async function autoCreateFeeRecords(studentId, batchFee) {
  const now = new Date();
  const operations = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    operations.push({
      updateOne: {
        filter: { student: studentId, month: d.getMonth(), year: d.getFullYear() },
        update: {
          $setOnInsert: {
            student:     studentId,
            month:       d.getMonth(),
            year:        d.getFullYear(),
            amount:      batchFee || 0,
            status:      'unpaid',
            paidAt:      null,
            note:        ''
          }
        },
        upsert: true
      }
    });
  }
  await FeeRecord.bulkWrite(operations);
}

// ─── UPDATE STUDENT STATUS ────────────────────────────────────
router.post('/students/:id/status', isAdmin, async (req, res) => {
  try {
    const { status, feeStatus, notes } = req.body;
    const update = {};
    if (status) {
      update.status = status;
      if (status === 'confirmed') {
        update.confirmedAt = new Date();
        // Auto-create 12 months of unpaid fee records
        const student = await Student.findById(req.params.id).populate('batch');
        const fee = student?.batch?.fee || 0;
        await autoCreateFeeRecords(req.params.id, fee);
      }
    }
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
    await FeeRecord.deleteMany({ student: req.params.id });
    await Student.findByIdAndDelete(req.params.id);
    req.flash('success', 'Student removed');
    res.redirect('/admin/students');
  } catch (err) {
    req.flash('error', 'Delete failed');
    res.redirect('/admin/students');
  }
});

// ─── FEE OVERVIEW PAGE ───────────────────────────────────────
router.get('/fees', isAdmin, async (req, res) => {
  try {
    const now   = new Date();
    const month = parseInt(req.query.month ?? now.getMonth());
    const year  = parseInt(req.query.year  ?? now.getFullYear());

    // All confirmed students
    const students = await Student.find({ status: 'confirmed' }).populate('batch').lean();

    // Auto-ensure every confirmed student has a record for selected month/year
    for (const s of students) {
      await FeeRecord.updateOne(
        { student: s._id, month, year },
        { $setOnInsert: {
            student:     s._id,
            studentName: s.studentName,
            month, year,
            amount:      s.batch?.fee || 0,
            status:      'unpaid',
            paidAt:      null,
            note:        ''
        }},
        { upsert: true }
      );
    }

    // Fee records for selected month/year
    const records = await FeeRecord.find({ month, year }).lean();
    const recordMap = {};
    records.forEach(r => { recordMap[r.student.toString()] = r; });

    // Build rows
    const rows = students.map(s => ({
      student: s,
      record: recordMap[s._id.toString()] || null
    }));

    const paid    = rows.filter(r => r.record?.status === 'paid').length;
    const unpaid  = rows.filter(r => !r.record || r.record.status === 'unpaid').length;
    const partial = rows.filter(r => r.record?.status === 'partial').length;
    const totalAmount = records.filter(r => r.status === 'paid').reduce((a, r) => a + r.amount, 0);

    // Build year list (enrolled year to current)
    const years = [];
    for (let y = now.getFullYear(); y >= now.getFullYear() - 2; y--) years.push(y);

    res.render('admin/fees', {
      page: 'fees',
      title: 'Fees — Akram Biology Admin',
      adminName: req.session.adminName,
      rows, month, year, MONTHS, years,
      stats: { paid, unpaid, partial, totalAmount, total: students.length },
      success: req.flash('success'),
      error:   req.flash('error')
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin/dashboard');
  }
});

// ─── MARK FEE (from overview page) ──────────────────────────
router.post('/fees/mark', isAdmin, async (req, res) => {
  try {
    const { studentId, month, year, status, amount, note } = req.body;
    const m = parseInt(month), y = parseInt(year);

    const student = await Student.findById(studentId);
    if (!student) { req.flash('error', 'Student not found'); return res.redirect(`/admin/fees?month=${m}&year=${y}`); }

    const record = await FeeRecord.findOneAndUpdate(
      { student: studentId, month: m, year: y },
      {
        student: studentId,
        studentName: student.studentName,
        month: m, year: y,
        amount: Number(amount) || 0,
        status,
        note: note || '',
        paidAt: status === 'paid' ? new Date() : null
      },
      { upsert: true, new: true }
    );

    // Send email if marked as paid and student has email
    if (status === 'paid' && student.email) {
      sendFeeConfirmation(student, record).catch(console.error);
    }

    req.flash('success', `Fee marked as ${status} for ${student.studentName}`);
    res.redirect(`/admin/fees?month=${m}&year=${y}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not update fee');
    res.redirect('/admin/fees');
  }
});

// ─── MARK FEE (from student detail page) ─────────────────────
router.post('/students/:id/fee', isAdmin, async (req, res) => {
  try {
    const { month, year, status, amount, note } = req.body;
    const m = parseInt(month), y = parseInt(year);

    const student = await Student.findById(req.params.id);
    if (!student) { req.flash('error', 'Student not found'); return res.redirect('/admin/students'); }

    const record = await FeeRecord.findOneAndUpdate(
      { student: req.params.id, month: m, year: y },
      {
        student: req.params.id,
        studentName: student.studentName,
        month: m, year: y,
        amount: Number(amount) || 0,
        status,
        note: note || '',
        paidAt: status === 'paid' ? new Date() : null
      },
      { upsert: true, new: true }
    );

    if (status === 'paid' && student.email) {
      sendFeeConfirmation(student, record).catch(console.error);
    }

    req.flash('success', `${MONTHS[m]} ${y} fee marked as ${status}`);
    res.redirect(`/admin/students/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Fee update failed');
    res.redirect(`/admin/students/${req.params.id}`);
  }
});

// ─── EDIT STUDENT DETAILS ────────────────────────────────────
router.post('/students/:id/edit', isAdmin, async (req, res) => {
  try {
    const { studentName, parentName, phone, email, className, batchId, notes } = req.body;

    // Validate required fields
    if (!studentName || !phone || !className) {
      req.flash('error', 'Name, phone and class are required.');
      return res.redirect(`/admin/students/${req.params.id}`);
    }

    const update = {
      studentName: studentName.trim(),
      parentName:  parentName?.trim() || '',
      phone:       phone.trim(),
      email:       email?.trim().toLowerCase() || '',
      className,
      notes:       notes?.trim() || ''
    };

    // If batch changed, update batchName and adjust student counts
    if (batchId) {
      const oldStudent = await Student.findById(req.params.id);
      const newBatch   = await Batch.findById(batchId);
      if (newBatch) {
        // Decrease old batch count
        if (oldStudent.batch && oldStudent.batch.toString() !== batchId) {
          await Batch.findByIdAndUpdate(oldStudent.batch, { $inc: { currentStudents: -1 } });
          await Batch.findByIdAndUpdate(batchId,          { $inc: { currentStudents:  1 } });
        }
        update.batch     = batchId;
        update.batchName = newBatch.name;
      }
    } else {
      update.batch     = null;
      update.batchName = '';
    }

    await Student.findByIdAndUpdate(req.params.id, update);
    req.flash('success', `✅ ${studentName} ki details update ho gayi!`);
    res.redirect(`/admin/students/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Edit failed. Please try again.');
    res.redirect(`/admin/students/${req.params.id}`);
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
