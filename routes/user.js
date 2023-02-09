const express = require("express");
const router = express.Router();
const multer = require("multer");
const userAuth = require("../middlewares/userAuth");
const { storage } = require("../utils/user");
const upload = multer({ storage });

const {
  getUser,
  registerGoogle,
  register,
  login,
  emailVerifyToken,
  resendToken,
  forgotPassword,
  forgotPasswordVerify,
  forgotPasswordReset,
  changePassword,
  changeEmail,
} = require("../controllers/user");

router.get("/getUser", userAuth, getUser);
router.get("/:id/verify/:token", emailVerifyToken);
router.get("/forgotPassword/:id/verify/:token", forgotPasswordVerify);

router.post("/registerGoogle", registerGoogle);
router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/resendToken", resendToken);
router.post("/forgotPassword", forgotPassword);
router.post("/resetForgotPassword/:id/verify/:token", forgotPasswordReset);

router.patch("/changePassword", userAuth, changePassword);
router.patch("/changeEmail", userAuth, changeEmail);
module.exports = router;
