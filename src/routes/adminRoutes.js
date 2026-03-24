const express = require('express');
const rateLimit = require('express-rate-limit');

const adminController = require('../controllers/adminController');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { ensureAuthenticated, ensureGuest, ensureRole } = require('../middleware/auth');
const upload = require('../config/upload');
const {
  objectIdRule,
  loginRules,
  studentRules,
  batchRules,
  feeRules,
  chapterRules,
  enrollmentStatusRules
} = require('../utils/validationRules');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts. Try again later.'
});

router.get('/login', ensureGuest, asyncHandler(adminController.getLogin));
router.post(
  '/login',
  ensureGuest,
  loginLimiter,
  loginRules,
  validateRequest,
  asyncHandler(adminController.postLogin)
);

router.post('/logout', ensureAuthenticated, asyncHandler(adminController.postLogout));

router.use(ensureAuthenticated, ensureRole('admin', 'staff'));

router.get('/dashboard', asyncHandler(adminController.getDashboard));

router.post(
  '/students',
  studentRules,
  validateRequest,
  asyncHandler(adminController.createStudent)
);
router.patch(
  '/students/:id',
  objectIdRule('id', 'Student'),
  studentRules,
  validateRequest,
  asyncHandler(adminController.updateStudent)
);
router.delete(
  '/students/:id',
  objectIdRule('id', 'Student'),
  validateRequest,
  asyncHandler(adminController.deleteStudent)
);

router.post(
  '/batches',
  batchRules,
  validateRequest,
  asyncHandler(adminController.createBatch)
);
router.patch(
  '/batches/:id',
  objectIdRule('id', 'Batch'),
  batchRules,
  validateRequest,
  asyncHandler(adminController.updateBatch)
);
router.delete(
  '/batches/:id',
  objectIdRule('id', 'Batch'),
  validateRequest,
  asyncHandler(adminController.deleteBatch)
);

router.post('/fees', feeRules, validateRequest, asyncHandler(adminController.createFee));
router.patch(
  '/fees/:id',
  objectIdRule('id', 'Fee'),
  feeRules,
  validateRequest,
  asyncHandler(adminController.updateFee)
);
router.delete(
  '/fees/:id',
  objectIdRule('id', 'Fee'),
  validateRequest,
  asyncHandler(adminController.deleteFee)
);

router.post(
  '/chapters',
  chapterRules,
  validateRequest,
  asyncHandler(adminController.createChapter)
);
router.delete(
  '/chapters/:chapterId',
  objectIdRule('chapterId', 'Chapter'),
  validateRequest,
  asyncHandler(adminController.deleteChapter)
);
router.post(
  '/chapters/:chapterId/files',
  objectIdRule('chapterId', 'Chapter'),
  validateRequest,
  upload.array('files', 10),
  asyncHandler(adminController.uploadChapterFiles)
);
router.delete(
  '/chapters/:chapterId/files/:fileId',
  objectIdRule('chapterId', 'Chapter'),
  objectIdRule('fileId', 'File'),
  validateRequest,
  asyncHandler(adminController.deleteChapterFile)
);

router.patch(
  '/messages/:id/read',
  objectIdRule('id', 'Message'),
  validateRequest,
  asyncHandler(adminController.markMessageRead)
);
router.patch(
  '/messages/read-all',
  asyncHandler(adminController.markAllMessagesRead)
);
router.delete(
  '/messages/:id',
  objectIdRule('id', 'Message'),
  validateRequest,
  asyncHandler(adminController.deleteMessage)
);

router.patch(
  '/enrollments/:id/status',
  objectIdRule('id', 'Enrollment'),
  enrollmentStatusRules,
  validateRequest,
  asyncHandler(adminController.updateEnrollmentStatus)
);

module.exports = router;
