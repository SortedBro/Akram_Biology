const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    dob: Date,
    guardianName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    relation: {
      type: String,
      trim: true,
      maxlength: 50
    },
    classLevel: {
      type: String,
      required: true,
      enum: ['9', '10', '11', '12']
    },
    board: {
      type: String,
      trim: true,
      default: 'BSEB/CBSE'
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    whatsapp: {
      type: String,
      trim: true,
      maxlength: 20
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300
    },
    schoolName: {
      type: String,
      trim: true,
      maxlength: 160
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'rejected'],
      default: 'new'
    }
  },
  {
    timestamps: true
  }
);

enrollmentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
