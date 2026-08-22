// backend/modules/fees/fees.record.model.js

const mongoose = require("mongoose");

const feeRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentClass: {
      type: String,
      required: true,
    },
    studentRollNo: {
      type: String,
    },
    academicYear: {
      type: String,
      required: true,
    },
    // Fee items with extended types
    feeItems: [
      {
        name: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        type: {
          type: String,
          enum: [
            "tuition",
            "admission",
            "exam",
            "library",
            "lab",
            "sports",
            "transport",
            "fine",
            "late_fee",
            "other",
          ],
          default: "other",
        },
        description: String,
      },
    ],
    totalFee: {
      type: Number,
      required: true,
      min: 0,
    },
    // Payment tracking
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRemaining: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountReason: {
      type: String,
      trim: true,
    },
    scholarshipPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    scholarshipAmount: {
      type: Number,
      default: 0,
    },
    lateFeeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Payment records
    payments: [
      {
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        paymentDate: {
          type: Date,
          default: Date.now,
        },
        paymentMethod: {
          type: String,
          enum: ["cash", "bank_transfer", "cheque", "online", "other"],
          required: true,
        },
        referenceNumber: {
          type: String,
          trim: true,
        },
        receiptNumber: {
          type: String,
          unique: true,
          sparse: true, // allow null/undefined for uniqueness
        },
        paymentType: {
          type: String,
          enum: [
            "tuition",
            "admission",
            "exam",
            "library",
            "lab",
            "sports",
            "transport",
            "late_fee",
            "fine",
            "other",
          ],
          required: true,
        },
        notes: {
          type: String,
          trim: true,
        },
        receivedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    // Status
    status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue", "cancelled"],
      default: "pending",
    },
    dueDate: {
      type: Date,
    },
    // Metadata
    notes: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
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
  },
);

// Indexes
feeRecordSchema.index({ studentId: 1, academicYear: 1 });
feeRecordSchema.index({ studentName: 1 });
feeRecordSchema.index({ status: 1 });
feeRecordSchema.index({ "payments.receiptNumber": 1 });
feeRecordSchema.index({ academicYear: 1 });

// Pre-save hook to generate receipt number for new payments
feeRecordSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Generate receipt numbers for new payments that don't have one
    for (const payment of this.payments) {
      if (!payment.receiptNumber) {
        const year = new Date().getFullYear().toString().slice(-2);
        // Count documents to create a sequential number (approx)
        const count = await this.constructor.countDocuments();
        const random = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0");
        payment.receiptNumber = `RCP${year}${(count + 1).toString().padStart(6, "0")}${random}`;
      }
    }
  } else {
    // For updates, check for new payments added (e.g., via push)
    // This is a simplification; in practice, you'd handle this differently.
    // We'll rely on the controller to set receipt numbers for new payments.
  }
  next();
});

// Instance methods
feeRecordSchema.methods.calculateTotals = function () {
  // Calculate total paid
  this.totalPaid = this.payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  // Calculate scholarship amount
  this.scholarshipAmount = (this.totalFee * this.scholarshipPercentage) / 100;

  // Calculate remaining
  this.totalRemaining =
    this.totalFee -
    this.totalPaid -
    this.scholarshipAmount -
    this.discountAmount +
    this.lateFeeAmount;

  // Update status
  if (this.totalRemaining <= 0) {
    this.status = "paid";
  } else if (this.totalPaid > 0) {
    this.status = "partial";
  } else if (this.dueDate && new Date() > this.dueDate) {
    this.status = "overdue";
  } else {
    this.status = "pending";
  }
};

// Static methods
feeRecordSchema.statics.getStudentFeeHistory = async function (studentId) {
  return this.find({
    studentId,
    isDeleted: false,
  }).sort({ createdAt: -1 });
};

feeRecordSchema.statics.getStudentBalance = async function (studentId) {
  const records = await this.find({
    studentId,
    isDeleted: false,
    status: { $in: ["pending", "partial", "overdue"] },
  });

  return records.reduce((total, record) => total + record.totalRemaining, 0);
};

feeRecordSchema.statics.getOutstandingFees = async function () {
  return this.find({
    isDeleted: false,
    status: { $in: ["pending", "partial", "overdue"] },
  })
    .populate("studentId", "firstName lastName studentId email phone")
    .sort({ dueDate: 1 });
};

feeRecordSchema.statics.getMonthlyCollection = async function (year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const records = await this.find({
    isDeleted: false,
    "payments.paymentDate": {
      $gte: startDate,
      $lte: endDate,
    },
  });

  let totalCollected = 0;
  let totalTransactions = 0;
  const paymentMethods = {};

  records.forEach((record) => {
    record.payments.forEach((payment) => {
      totalCollected += payment.amount;
      totalTransactions++;

      if (paymentMethods[payment.paymentMethod]) {
        paymentMethods[payment.paymentMethod] += payment.amount;
      } else {
        paymentMethods[payment.paymentMethod] = payment.amount;
      }
    });
  });

  return {
    year,
    month,
    totalCollected,
    totalTransactions,
    paymentMethods,
  };
};

const FeeRecord = mongoose.model("FeeRecord", feeRecordSchema);
module.exports = FeeRecord;
