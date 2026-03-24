const express = require('express');
const rateLimit = require('express-rate-limit');

const publicController = require('../controllers/publicController');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { enrollmentRules, contactRules } = require('../utils/validationRules');

const router = express.Router();

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});

router.get('/', asyncHandler(publicController.getHome));
router.get('/notes', asyncHandler(publicController.getNotes));

router.post(
  '/enroll',
  formLimiter,
  enrollmentRules,
  validateRequest,
  asyncHandler(publicController.postEnrollment)
);

router.post(
  '/contact',
  formLimiter,
  contactRules,
  validateRequest,
  asyncHandler(publicController.postContact)
);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
