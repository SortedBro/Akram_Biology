const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    classLevel: {
      type: String,
      enum: ['9', '10', '11', '12', '']
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

contactMessageSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
