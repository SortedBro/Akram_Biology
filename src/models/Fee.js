const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    month: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['due', 'partial', 'paid'],
      default: 'due'
    },
    note: {
      type: String,
      trim: true,
      maxlength: 300
    },
    paidAt: Date
  },
  {
    timestamps: true
  }
);

feeSchema.index({ student: 1, month: 1 }, { unique: true });
feeSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Fee', feeSchema);
