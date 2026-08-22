const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // explicitly string
  sequence: { type: Number, default: 0 },
});

// Prevent OverwriteModelError
const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);
module.exports = Counter;
