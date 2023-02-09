const mongoose = require("mongoose");
const { isEmail } = require("validator");

const SellerSchema = new mongoose.Schema({
  name: { type: String, maxLength: 35 },
  surname: { type: String, maxLength: 35 },
  address: { type: String, maxLength: 35 },
  phoneNumber: { type: Number, maxLength: 35 },
  city: { type: String, maxLength: 35 },
  postCode: { type: String, maxLength: 35 },
});

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      maxLength: 50,
      validate: [isEmail, "Email is not valid"],
    },
    password: { type: String },
    avatar: { type: String },
    seller: { type: SellerSchema, required: false },
    isAuthenticated: { type: Boolean, default: false },
    isGoogleUser: { type: Boolean, default: false },
    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "offer" }],
    recentlyWatched: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
        watchedTime: { type: Number },
      },
    ],
    opinionsFromUsers: {
      positive: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      opinionsUserIds: [String],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", UserSchema);

module.exports = { User };
