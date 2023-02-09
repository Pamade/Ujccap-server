const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
  token: { type: String, required: true, unique: true },
});

const Token = mongoose.model("token", TokenSchema);
module.exports = Token;
