const Batch = require('../models/Batch');
const NoteChapter = require('../models/NoteChapter');
const Enrollment = require('../models/Enrollment');
const ContactMessage = require('../models/ContactMessage');

async function getHome(req, res) {
  const [batches, noteCounts] = await Promise.all([
    Batch.find({ status: 'active' }).sort({ classLevel: 1, name: 1 }).lean(),
    NoteChapter.aggregate([
      {
        $group: {
          _id: '$classLevel',
          chapters: { $sum: 1 },
          files: { $sum: { $size: '$files' } }
        }
      }
    ])
  ]);

  const countsMap = noteCounts.reduce((acc, item) => {
    acc[item._id] = item;
    return acc;
  }, {});

  res.render('public/home', {
    title: 'Home',
    batches,
    countsMap,
    hideHeader: true
  });
}

async function getNotes(req, res) {
  const selectedClass = String(req.query.class || '11');
  const [chapters, chapterCounts] = await Promise.all([
    NoteChapter.find({ classLevel: selectedClass })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean(),
    NoteChapter.aggregate([
      {
        $group: {
          _id: '$classLevel',
          chapters: { $sum: 1 }
        }
      }
    ])
  ]);

  const chapterCountMap = chapterCounts.reduce((acc, item) => {
    acc[item._id] = item.chapters;
    return acc;
  }, {});

  res.render('public/notes', {
    title: 'Notes',
    selectedClass,
    chapters,
    chapterCountMap,
    hideHeader: true
  });
}

async function postEnrollment(req, res) {
  const payload = {
    fullName: req.body.fullName,
    dob: req.body.dob || undefined,
    guardianName: req.body.guardianName,
    relation: req.body.relation,
    classLevel: req.body.classLevel,
    board: req.body.board,
    phone: req.body.phone,
    whatsapp: req.body.whatsapp,
    email: req.body.email,
    address: req.body.address,
    schoolName: req.body.schoolName,
    message: req.body.message
  };

  await Enrollment.create(payload);
  req.flash('success', 'Enrollment request submitted successfully.');
  res.redirect('/#enroll');
}

async function postContact(req, res) {
  await ContactMessage.create({
    fullName: req.body.fullName,
    phone: req.body.phone,
    classLevel: req.body.classLevel || '',
    message: req.body.message
  });

  req.flash('success', 'Message sent successfully. We will contact you soon.');
  res.redirect('/#contact');
}

module.exports = {
  getHome,
  getNotes,
  postEnrollment,
  postContact
};
