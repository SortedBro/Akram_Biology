const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    classLevel: {
      type: String,
      required: true,
      enum: ['9', '10', '11', '12']
    },
    timing: {
      type: String,
      trim: true,
      maxlength: 60
    },
    days: {
      type: String,
      trim: true,
      maxlength: 60
    },
    capacity: {
      type: Number,
      default: 20,
      min: 1,
      max: 500
    },
    status: {
      type: String,
      enum: ['active', 'paused'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

batchSchema.index({ classLevel: 1, status: 1 });

module.exports = mongoose.model('Batch', batchSchema);
