const mongoose = require('mongoose');

// ─── STUDENT MODEL ───────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  parentName:  { type: String, trim: true },
  phone:       { type: String, required: true, trim: true },
  email:       { type: String, trim: true, lowercase: true },
  className: {
    type: String, required: true,
    enum: ['Class 9','Class 10','Class 11','Class 12','NEET Dropper']
  },
  batch:     { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  batchName: String,
  message:   String,
  status:    { type: String, enum: ['pending','confirmed','cancelled'], default: 'pending' },
  feeStatus: { type: String, enum: ['unpaid','paid','partial'],         default: 'unpaid'  },
  enrolledAt:  { type: Date, default: Date.now },
  confirmedAt: Date,
  notes: String
}, { timestamps: true });

// ─── FEE RECORD MODEL ────────────────────────────────────────
// One document per student per month
const feeRecordSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: String,
  month:       { type: Number, required: true },   // 0-11
  year:        { type: Number, required: true },
  amount:      { type: Number, required: true },
  status:      { type: String, enum: ['paid','unpaid','partial'], default: 'unpaid' },
  paidAt:      Date,
  note:        String
}, { timestamps: true });

// Unique index: one record per student per month/year
feeRecordSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

// ─── BATCH MODEL ─────────────────────────────────────────────
const batchSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  className:   { type: String, required: true },
  days:        [String],
  time:        String,
  fee:         Number,
  maxStudents: { type: Number, default: 15 },
  currentStudents: { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  description: String
}, { timestamps: true });

batchSchema.virtual('seatsLeft').get(function(){ return this.maxStudents - this.currentStudents; });
batchSchema.virtual('isFull').get(function(){ return this.currentStudents >= this.maxStudents; });
batchSchema.set('toJSON',   { virtuals: true });
batchSchema.set('toObject', { virtuals: true });

// ─── CONTACT MODEL ───────────────────────────────────────────
const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  phone:   { type: String, required: true },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false }
}, { timestamps: true });

// ─── ADMIN MODEL ─────────────────────────────────────────────
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

module.exports = {
  Student:   mongoose.model('Student',   studentSchema),
  FeeRecord: mongoose.model('FeeRecord', feeRecordSchema),
  Batch:     mongoose.model('Batch',     batchSchema),
  Contact:   mongoose.model('Contact',   contactSchema),
  Admin:     mongoose.model('Admin',     adminSchema)
};
