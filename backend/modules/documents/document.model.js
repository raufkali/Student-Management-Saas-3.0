const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["pdf", "image", "document", "spreadsheet", "other"],
      required: true,
    },
    category: {
      type: String,
      enum: ["student", "academic", "administrative", "financial", "other"],
      default: "other",
    },
    filePath: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    version: {
      type: Number,
      default: 1,
    },
    previousVersions: [
      {
        filePath: String,
        fileName: String,
        fileSize: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes
documentSchema.index({ title: 1 });
documentSchema.index({ studentId: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ tags: 1 });

// Pre-find middleware
documentSchema.pre(/^find/, function (next) {
  if (this.getQuery().includeDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

// Instance methods
documentSchema.methods.getFileUrl = function (baseUrl = "/uploads") {
  if (!this.filePath) return null;
  const relativePath = this.filePath.replace(/\\/g, "/");
  return `${baseUrl}/${relativePath}`;
};

documentSchema.methods.getFileInfo = function () {
  return {
    name: this.fileName,
    size: this.fileSize,
    type: this.mimeType,
    path: this.filePath,
    url: this.getFileUrl(),
  };
};

// Static methods
documentSchema.statics.getDocumentsByStudent = async function (studentId) {
  return this.find({
    studentId,
    isDeleted: { $ne: true },
  }).sort({ createdAt: -1 });
};

documentSchema.statics.getDocumentsByCategory = async function (category) {
  return this.find({
    category,
    isDeleted: { $ne: true },
  }).sort({ createdAt: -1 });
};

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
