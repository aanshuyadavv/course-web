const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require("../models/userModel")

const courseSchema = new Schema({
  image: { type: String, default: "wdc.jpg" },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // Discount in percentage
  category: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

courseSchema.virtual("discountedPrice").get(function () {
  return this.price - (this.price * this.discount) / 100;
});

module.exports = mongoose.model("Course", courseSchema);
