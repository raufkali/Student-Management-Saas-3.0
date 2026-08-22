const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Setting key is required"],
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Setting value is required"],
    },
    category: {
      type: String,
      enum: ["general", "academic", "financial", "notification", "system"],
      default: "general",
    },
    description: {
      type: String,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
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
settingSchema.index({ key: 1 });
settingSchema.index({ category: 1 });

// Static methods
settingSchema.statics.getSetting = async function (key) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : null;
};

settingSchema.statics.getSettingsByCategory = async function (category) {
  return this.find({ category });
};

settingSchema.statics.setSetting = async function (
  key,
  value,
  category = "general",
  description = "",
) {
  return this.findOneAndUpdate(
    { key },
    { value, category, description },
    { new: true, upsert: true, runValidators: true },
  );
};

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
