// models/FeeStructure.js
const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Fee structure name is required"],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, "Grade is required"],
      uppercase: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
    },
    feeItems: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        type: {
          type: String,
          enum: ["tuition", "admission", "exam", "library", "lab", "sports", "transport", "other"],
          default: "other",
        },
        frequency: {
          type: String,
          enum: ["one-time", "monthly", "quarterly", "semester", "annual"],
          default: "monthly",
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
feeStructureSchema.index({ grade: 1, academicYear: 1 });
feeStructureSchema.index({ name: 1 });
feeStructureSchema.index({ isActive: 1 });

// Instance methods
feeStructureSchema.methods.calculateTotal = function() {
  this.totalAmount = this.feeItems.reduce((sum, item) => sum + item.amount, 0);
  return this.totalAmount;
};

// Static methods
feeStructureSchema.statics.getActiveStructures = async function(grade, academicYear) {
  const filter = { isActive: true };
  if (grade) filter.grade = grade.toUpperCase();
  if (academicYear) filter.academicYear = academicYear;
  
  return this.find(filter).sort({ grade: 1, name: 1 });
};

feeStructureSchema.statics.getStructuresByGrade = async function(grade) {
  return this.find({
    grade: grade.toUpperCase(),
    isActive: true,
  }).sort({ academicYear: -1 });
};

feeStructureSchema.statics.getStructuresByAcademicYear = async function(academicYear) {
  return this.find({
    academicYear,
    isActive: true,
  }).sort({ grade: 1 });
};

feeStructureSchema.statics.cloneForNewYear = async function(sourceId, newAcademicYear, userId) {
  const source = await this.findById(sourceId);
  if (!source) {
    throw new Error("Source fee structure not found");
  }
  
  const newStructure = new this({
    name: `${source.name} (${newAcademicYear})`,
    grade: source.grade,
    academicYear: newAcademicYear,
    feeItems: source.feeItems.map(item => ({
      ...item,
      _id: undefined, // Remove _id to create new items
    })),
    totalAmount: source.totalAmount,
    isActive: true,
    createdBy: userId,
  });
  
  await newStructure.save();
  return newStructure;
};

const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);
module.exports = FeeStructure;