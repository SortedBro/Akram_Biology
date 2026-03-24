const { body, param } = require('express-validator');

const classRule = (field = 'classLevel') =>
  body(field)
    .trim()
    .isIn(['9', '10', '11', '12'])
    .withMessage('Class must be 9, 10, 11 or 12.');

const objectIdRule = (field, label) =>
  param(field).isMongoId().withMessage(`${label} id is invalid.`);

const enrollmentRules = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Student name is required.'),
  classRule(),
  body('guardianName')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Guardian name is required.'),
  body('phone')
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Valid phone number is required.')
];

const contactRules = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Name is required.'),
  body('phone')
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone is required.'),
  body('message')
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Message should be 3-1000 characters.')
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password is required.')
];

const studentRules = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Student name is required.'),
  classRule(),
  body('phone')
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Valid phone number is required.')
];

const batchRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Batch name is required.'),
  classRule(),
  body('capacity')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 500 })
    .withMessage('Capacity should be between 1 and 500.')
];

const feeRules = [
  body('student').isMongoId().withMessage('Student is required.'),
  body('month')
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
    .withMessage('Month format should be YYYY-MM.'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be valid.')
];

const chapterRules = [
  classRule(),
  body('title')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Chapter title is required.')
];

const enrollmentStatusRules = [
  body('status')
    .isIn(['new', 'contacted', 'converted', 'rejected'])
    .withMessage('Invalid status.')
];

module.exports = {
  objectIdRule,
  enrollmentRules,
  contactRules,
  loginRules,
  studentRules,
  batchRules,
  feeRules,
  chapterRules,
  enrollmentStatusRules
};
