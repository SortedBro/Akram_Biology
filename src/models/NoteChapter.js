const mongoose = require('mongoose');

const noteFileSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    originalName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    sizeInBytes: {
      type: Number,
      required: true
    }
  },
  { _id: true, timestamps: true }
);

const noteChapterSchema = new mongoose.Schema(
  {
    classLevel: {
      type: String,
      required: true,
      enum: ['9', '10', '11', '12']
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300
    },
    sortOrder: {
      type: Number,
      default: 100
    },
    files: [noteFileSchema]
  },
  {
    timestamps: true
  }
);

noteChapterSchema.index({ classLevel: 1, sortOrder: 1, createdAt: 1 });

module.exports = mongoose.model('NoteChapter', noteChapterSchema);
