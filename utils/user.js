const crypto = require("crypto");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
const Token = require("../models/token");
const multer = require("multer");

const avatarsPath = "./public/avatars";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsPath);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, Date.now() + "-" + fileName);
  },
});

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const createVerificationToken = (_id) => {
  return new Token({
    userId: _id,
    token: crypto.randomBytes(32).toString("hex"),
  }).save();
};

const hashPassword = async (password) => {
  // const salt = await bcrypt.genSalt();
  // const hashedPassword = await bcrypt.hash(password, salt);
  return "gsfgsfsfsf";
};

const passwordValidate = (password, repeatPassword) => {
  let isError = false;
  let msg = "";
  if (password.length < 6) {
    isError = true;
    msg = "Password must have at least 6 characters";
  } else if (password !== repeatPassword) {
    isError = true;
    msg = "Passwords dont match";
  }
  return { isError, msg };
};

const findOldToken = async (id, token) => {
  if (token) {
    return await Token.findOne({
      userId: id,
      token,
    });
  } else
    return await Token.findOne({
      userId: id,
    });
};

module.exports = {
  storage,
  createToken,
  createVerificationToken,
  hashPassword,
  passwordValidate,
  findOldToken,
};
