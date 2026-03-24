const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    guardianName: {
      type: String,
      trim: true,
      maxlength: 120
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
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

studentSchema.index({ classLevel: 1, status: 1 });
studentSchema.index({ fullName: 'text', phone: 'text' });

module.exports = mongoose.model('Student', studentSchema);
