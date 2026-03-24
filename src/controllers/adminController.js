const User = require('../models/User');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Fee = require('../models/Fee');
const NoteChapter = require('../models/NoteChapter');
const ContactMessage = require('../models/ContactMessage');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/AppError');

const DASHBOARD_TABS = new Set([
  'dashboard',
  'students',
  'batches',
  'fees',
  'messages',
  'notes',
  'enrollments'
]);

function safeTab(tab) {
  if (!tab) return 'dashboard';
  if (tab === 'overview') return 'dashboard';
  return DASHBOARD_TABS.has(tab) ? tab : 'dashboard';
}

function dashboardUrl(tab, extra = {}) {
  const params = new URLSearchParams();
  params.set('tab', safeTab(tab));
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  return `/admin/dashboard?${params.toString()}`;
}

async function getLogin(req, res) {
  res.render('admin/login', {
    title: 'Admin Login',
    hideHeader: true
  });
}

async function postLogin(req, res) {
  const user = await User.findOne({
    email: String(req.body.email).toLowerCase().trim(),
    isActive: true
  }).select('+password');

  if (!user) {
    req.flash('error', 'Invalid credentials.');
    return res.redirect('/admin/login');
  }

  const isValid = await user.verifyPassword(req.body.password);
  if (!isValid) {
    req.flash('error', 'Invalid credentials.');
    return res.redirect('/admin/login');
  }

  user.lastLoginAt = new Date();
  await user.save();

  req.session.userId = String(user._id);
  req.session.role = user.role;
  req.session.user = {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    role: user.role
  };

  req.flash('success', 'Welcome back.');
  return res.redirect(dashboardUrl('dashboard'));
}

function postLogout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('akram.sid');
    res.redirect('/admin/login');
  });
}

async function getDashboard(req, res) {
  const activeTab = safeTab(String(req.query.tab || 'dashboard'));
  const selectedNotesClass = String(req.query.class || '11');

  const [
    students,
    batches,
    fees,
    messages,
    enrollments,
    totalStudents,
    activeStudents,
    pendingFees,
    unreadMessages,
    chapters
  ] = await Promise.all([
    Student.find().sort({ createdAt: -1 }).lean(),
    Batch.find().sort({ classLevel: 1, name: 1 }).lean(),
    Fee.find().populate('student').sort({ createdAt: -1 }).lean(),
    ContactMessage.find().sort({ createdAt: -1 }).lean(),
    Enrollment.find().sort({ createdAt: -1 }).lean(),
    Student.countDocuments(),
    Student.countDocuments({ status: 'active' }),
    Fee.countDocuments({ status: { $ne: 'paid' } }),
    ContactMessage.countDocuments({ isRead: false }),
    NoteChapter.find({ classLevel: selectedNotesClass })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean()
  ]);

  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    hideHeader: true,
    activeTab,
    selectedNotesClass,
    stats: {
      totalStudents,
      activeStudents,
      pendingFees,
      unreadMessages,
      totalBatches: batches.length,
      totalChapters: chapters.length
    },
    students,
    batches,
    fees,
    messages,
    enrollments,
    chapters
  });
}

async function createStudent(req, res) {
  await Student.create({
    fullName: req.body.fullName,
    guardianName: req.body.guardianName,
    classLevel: req.body.classLevel,
    board: req.body.board,
    phone: req.body.phone,
    whatsapp: req.body.whatsapp,
    email: req.body.email,
    address: req.body.address,
    schoolName: req.body.schoolName,
    status: req.body.status || 'active'
  });

  req.flash('success', 'Student created.');
  res.redirect(dashboardUrl('students'));
}

async function updateStudent(req, res, next) {
  const updated = await Student.findByIdAndUpdate(
    req.params.id,
    {
      fullName: req.body.fullName,
      guardianName: req.body.guardianName,
      classLevel: req.body.classLevel,
      board: req.body.board,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp,
      email: req.body.email,
      address: req.body.address,
      schoolName: req.body.schoolName,
      status: req.body.status || 'active'
    },
    { runValidators: true }
  );

  if (!updated) {
    return next(new AppError('Student not found.', 404));
  }

  req.flash('success', 'Student updated.');
  return res.redirect(dashboardUrl('students'));
}

async function deleteStudent(req, res) {
  await Student.findByIdAndDelete(req.params.id);
  await Fee.deleteMany({ student: req.params.id });
  req.flash('success', 'Student deleted.');
  res.redirect(dashboardUrl('students'));
}

async function createBatch(req, res) {
  await Batch.create({
    name: req.body.name,
    classLevel: req.body.classLevel,
    timing: req.body.timing,
    days: req.body.days,
    capacity: Number(req.body.capacity) || 20,
    status: req.body.status || 'active'
  });

  req.flash('success', 'Batch created.');
  res.redirect(dashboardUrl('batches'));
}

async function updateBatch(req, res, next) {
  const updated = await Batch.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      classLevel: req.body.classLevel,
      timing: req.body.timing,
      days: req.body.days,
      capacity: Number(req.body.capacity) || 20,
      status: req.body.status || 'active'
    },
    { runValidators: true }
  );

  if (!updated) {
    return next(new AppError('Batch not found.', 404));
  }

  req.flash('success', 'Batch updated.');
  return res.redirect(dashboardUrl('batches'));
}

async function deleteBatch(req, res) {
  await Batch.findByIdAndDelete(req.params.id);
  req.flash('success', 'Batch deleted.');
  res.redirect(dashboardUrl('batches'));
}

async function createFee(req, res) {
  const payload = {
    student: req.body.student,
    month: req.body.month,
    amount: Number(req.body.amount),
    status: req.body.status,
    note: req.body.note
  };

  if (payload.status === 'paid') {
    payload.paidAt = new Date();
  }

  await Fee.create(payload);
  req.flash('success', 'Fee record created.');
  res.redirect(dashboardUrl('fees'));
}

async function updateFee(req, res, next) {
  const payload = {
    student: req.body.student,
    month: req.body.month,
    amount: Number(req.body.amount),
    status: req.body.status,
    note: req.body.note,
    paidAt: req.body.status === 'paid' ? new Date() : undefined
  };

  const updated = await Fee.findByIdAndUpdate(req.params.id, payload, {
    runValidators: true
  });

  if (!updated) {
    return next(new AppError('Fee record not found.', 404));
  }

  req.flash('success', 'Fee record updated.');
  return res.redirect(dashboardUrl('fees'));
}

async function deleteFee(req, res) {
  await Fee.findByIdAndDelete(req.params.id);
  req.flash('success', 'Fee record deleted.');
  res.redirect(dashboardUrl('fees'));
}

async function createChapter(req, res) {
  await NoteChapter.create({
    classLevel: req.body.classLevel,
    title: req.body.title,
    description: req.body.description,
    sortOrder: Number(req.body.sortOrder) || 100
  });

  req.flash('success', 'Chapter created.');
  res.redirect(dashboardUrl('notes', { class: req.body.classLevel }));
}

async function deleteChapter(req, res) {
  const chapter = await NoteChapter.findById(req.params.chapterId);
  if (!chapter) {
    throw new AppError('Chapter not found.', 404);
  }

  const chapterClass = chapter.classLevel;
  await chapter.deleteOne();
  req.flash('success', 'Chapter deleted.');
  res.redirect(dashboardUrl('notes', { class: chapterClass }));
}

async function uploadChapterFiles(req, res, next) {
  const chapter = await NoteChapter.findById(req.params.chapterId);
  if (!chapter) {
    return next(new AppError('Chapter not found.', 404));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please choose at least one file.', 400));
  }

  req.files.forEach((file) => {
    chapter.files.push({
      title: req.body.fileTitle?.trim() || file.originalname.replace(/\.[^.]+$/, ''),
      originalName: file.originalname,
      fileUrl: `/public/uploads/${file.filename}`,
      mimeType: file.mimetype,
      sizeInBytes: file.size
    });
  });

  await chapter.save();
  req.flash('success', `${req.files.length} file(s) uploaded.`);
  return res.redirect(dashboardUrl('notes', { class: chapter.classLevel }));
}

async function deleteChapterFile(req, res, next) {
  const chapter = await NoteChapter.findById(req.params.chapterId);
  if (!chapter) {
    return next(new AppError('Chapter not found.', 404));
  }

  const fileDoc = chapter.files.id(req.params.fileId);
  if (!fileDoc) {
    return next(new AppError('File not found.', 404));
  }

  fileDoc.deleteOne();
  await chapter.save();
  req.flash('success', 'File deleted.');
  return res.redirect(dashboardUrl('notes', { class: chapter.classLevel }));
}

async function markMessageRead(req, res, next) {
  const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!msg) {
    return next(new AppError('Message not found.', 404));
  }
  req.flash('success', 'Message marked as read.');
  return res.redirect(dashboardUrl('messages'));
}

async function markAllMessagesRead(req, res) {
  await ContactMessage.updateMany({ isRead: false }, { isRead: true });
  req.flash('success', 'All messages marked as read.');
  return res.redirect(dashboardUrl('messages'));
}

async function deleteMessage(req, res) {
  await ContactMessage.findByIdAndDelete(req.params.id);
  req.flash('success', 'Message deleted.');
  res.redirect(dashboardUrl('messages'));
}

async function updateEnrollmentStatus(req, res, next) {
  const enrollment = await Enrollment.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );

  if (!enrollment) {
    return next(new AppError('Enrollment not found.', 404));
  }

  req.flash('success', 'Enrollment status updated.');
  return res.redirect(dashboardUrl('enrollments'));
}

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getDashboard,
  createStudent,
  updateStudent,
  deleteStudent,
  createBatch,
  updateBatch,
  deleteBatch,
  createFee,
  updateFee,
  deleteFee,
  createChapter,
  deleteChapter,
  uploadChapterFiles,
  deleteChapterFile,
  markMessageRead,
  markAllMessagesRead,
  deleteMessage,
  updateEnrollmentStatus
};
