const mongoose = require('mongoose');

// ─── STUDENT MODEL ───────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  parentName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  className: {
    type: String,
    required: [true, 'Class is required'],
    enum: ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'NEET Dropper']
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  },
  batchName: String,
  message: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  feeStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'partial'],
    default: 'unpaid'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  notes: String
}, { timestamps: true });

// ─── BATCH MODEL ─────────────────────────────────────────────
const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  className: {
    type: String,
    required: true
  },
  days: [String],        // ['Monday', 'Wednesday', 'Saturday']
  time: String,          // '4:00 PM – 6:00 PM'
  fee: Number,           // monthly fee
  maxStudents: {
    type: Number,
    default: 15
  },
  currentStudents: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: String
}, { timestamps: true });

// Virtual: seats left
batchSchema.virtual('seatsLeft').get(function () {
  return this.maxStudents - this.currentStudents;
});
batchSchema.virtual('isFull').get(function () {
  return this.currentStudents >= this.maxStudents;
});
batchSchema.set('toJSON', { virtuals: true });
batchSchema.set('toObject', { virtuals: true });

// ─── CONTACT MODEL ───────────────────────────────────────────
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// ─── ADMIN MODEL ─────────────────────────────────────────────
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

module.exports = {
  Student: mongoose.model('Student', studentSchema),
  Batch:   mongoose.model('Batch',   batchSchema),
  Contact: mongoose.model('Contact', contactSchema),
  Admin:   mongoose.model('Admin',   adminSchema)
};
