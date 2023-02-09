const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    mainImage: { type: String, required: true },
    name: { type: String, required: true, maxLength: 35 },
    description: { type: String, required: true, maxLength: 500 },
    price: { type: Number, required: true, maxLength: 35 },
    images: { type: Array, maxLength: 6 },
    categories: { type: Array, maxLength: 6, required: true },
    location: { type: String, required: true, maxLength: 35 },
    createdAt: Date,
    expirationDate: {
      type: Date,
      required: true,
      default: Date.now() + 24 * 60 * 60 * 1000,
    },
  },
  { timestamps: true }
);
const Offer = mongoose.model("offer", offerSchema);

module.exports = Offer;
