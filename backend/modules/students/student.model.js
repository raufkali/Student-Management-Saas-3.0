const mongoose = require("mongoose");
const crypto = require("crypto");

const studentSchema = new mongoose.Schema(
  {
    // -----------------------------------------------------------------
    // PRIMARY IDENTIFIERS
    // -----------------------------------------------------------------

    // 1. Auto‑generated internal student ID (optional, created in pre‑save)
    studentId: {
      type: String,
      unique: true,
      trim: true,
      // not required – generated if not provided
    },

    // 2. Manually entered registration number (NEW)
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      trim: true,
      uppercase: true, // optional – enforce consistency
      // You can add a custom validation, e.g. minlength, pattern
    },

    // -----------------------------------------------------------------
    // PERSONAL INFORMATION (unchanged)
    // -----------------------------------------------------------------
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
    },
    nationality: {
      type: String,
      required: [true, "Nationality is required"],
      trim: true,
    },
    religion: { type: String, trim: true },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, "Please provide a valid phone number"],
    },

    address: {
      street: { type: String, trim: true },
      city: { type: String, required: [true, "City is required"], trim: true },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      postalCode: { type: String, trim: true },
      country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
      },
    },

    enrollmentDate: {
      type: Date,
      required: [true, "Enrollment date is required"],
      default: Date.now,
    },

    grade: {
      type: String,
      required: [true, "Grade is required"],
      trim: true,
      uppercase: true,
    },
    section: { type: String, trim: true },
    rollNumber: { type: String, trim: true },

    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
    },

    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true,
    },
    fatherOccupation: { type: String, trim: true },
    fatherPhone: {
      type: String,
      required: [true, "Father's phone is required"],
      trim: true,
    },
    fatherEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },

    motherName: {
      type: String,
      required: [true, "Mother's name is required"],
      trim: true,
    },
    motherOccupation: { type: String, trim: true },
    motherPhone: { type: String, trim: true },
    motherEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },

    guardianAddress: { type: String, trim: true },

    // -----------------------------------------------------------------
    // DOCUMENTS & FILES (unchanged)
    // -----------------------------------------------------------------
    photo: { type: String, default: null },
    birthCertificate: { type: String, default: null },
    medicalRecords: { type: String, default: null },
    previousSchoolRecords: { type: String, default: null },

    otherDocuments: [
      {
        name: String,
        file: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // -----------------------------------------------------------------
    // FINANCIAL (unchanged)
    // -----------------------------------------------------------------
    feeStructure: { type: mongoose.Schema.Types.ObjectId, ref: "FeeStructure" },
    scholarship: { type: String, trim: true },
    scholarshipPercentage: { type: Number, min: 0, max: 100 },

    // -----------------------------------------------------------------
    // STATUS & META (unchanged)
    // -----------------------------------------------------------------
    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "graduated",
        "withdrawn",
        "suspended",
        "failed",
      ],
      default: "active",
    },
    isEnrolled: { type: Boolean, default: true },

    medicalConditions: { type: String, trim: true },
    specialNeeds: { type: String, trim: true },
    extracurricularActivities: [{ type: String, trim: true }],
    notes: { type: String, trim: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

// -----------------------------------------------------------------
// INDEXES – add registrationNumber index
// -----------------------------------------------------------------
studentSchema.index({ firstName: 1, lastName: 1 });
studentSchema.index({ phone: 1 });
studentSchema.index({ grade: 1, section: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ enrollmentDate: -1 });
studentSchema.index({ registrationNumber: 1 }); // NEW

// -----------------------------------------------------------------
// SOFT DELETE HOOKS (unchanged)
// -----------------------------------------------------------------
studentSchema.pre("find", function () {
  if (this.getQuery().includeDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
});
studentSchema.pre("findOne", function () {
  if (this.getQuery().includeDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
});
studentSchema.pre("countDocuments", function () {
  if (this.getQuery().includeDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
});

// -----------------------------------------------------------------
// PRE‑SAVE HOOK – generate studentId ONLY if not provided
// -----------------------------------------------------------------
studentSchema.pre("save", async function () {
  if (!this.studentId || this.studentId.trim() === "") {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    this.studentId = `STU${timestamp}${random}`;
  }
  // registrationNumber is NOT auto‑generated – it must be provided by the user.
});

// -----------------------------------------------------------------
// INSTANCE METHODS (unchanged)
// -----------------------------------------------------------------
studentSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

studentSchema.methods.getAge = function () {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

studentSchema.methods.getAddressString = function () {
  const parts = [
    this.address?.street,
    this.address?.city,
    this.address?.state,
    this.address?.postalCode,
    this.address?.country,
  ].filter(Boolean);
  return parts.join(", ");
};

// -----------------------------------------------------------------
// STATIC METHODS (unchanged)
// -----------------------------------------------------------------
studentSchema.statics.searchStudents = async function (searchTerm) {
  if (!searchTerm) return [];
  const searchRegex = new RegExp(searchTerm, "i");
  return this.find({
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { studentId: searchRegex },
      { registrationNumber: searchRegex }, // NEW – include in search
      { email: searchRegex },
      { phone: searchRegex },
      { "address.city": searchRegex },
      { "address.state": searchRegex },
    ],
  });
};

// -----------------------------------------------------------------
// VIRTUALS (unchanged)
// -----------------------------------------------------------------
studentSchema.virtual("fullName").get(function () {
  return this.getFullName();
});
studentSchema.virtual("age").get(function () {
  return this.getAge();
});
studentSchema.virtual("addressFull").get(function () {
  return this.getAddressString();
});

// -----------------------------------------------------------------
// JSON / OBJECT SERIALIZATION – ensure _id is a string (default)
// -----------------------------------------------------------------
studentSchema.set("toJSON", { virtuals: true });
studentSchema.set("toObject", { virtuals: true });

// -----------------------------------------------------------------
// MODEL EXPORT (unchanged)
// -----------------------------------------------------------------
const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);
module.exports = Student;
