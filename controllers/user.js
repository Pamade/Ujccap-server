const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const { isEmail } = require("validator");

const {
  createToken,
  createVerificationToken,
  hashPassword,
  passwordValidate,
  findOldToken,
} = require("../utils/user");
const {
  INVALID_CREDENTIALS,
  INTERNAL_ERROR,
  ALL_FIELDS_REQUIRED,
  INVALID_LINK,
} = require("../utils/errors");

const getUser = async (req, res) => {
  try {
    const { id } = req.user;
    let user = await User.findById(id);
    user.password = "";
    res.status(200).json({ data: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const registerGoogle = async (req, res) => {
  try {
    const { email, avatar } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists && !userExists.isGoogleUser) {
      return res.status(401).json({
        err: "User previously registered with email via register form!",
      });
    }
    if (!userExists) {
      const user = await new User({
        email,
        avatar: avatar,
        isAuthenticated: true,
        isGoogleUser: true,
      }).save();

      const token = createToken(user.id);
      return res.status(200).json({
        data: { token, user },
      });
    } else if (userExists.isGoogleUser) {
      const token = createToken(userExists.id);
      return res.status(200).json({ data: { user: userExists, token } });
    }
    return res
      .status(400)
      .json({ err: "User with that email was created through registration" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ err: "Not authenticated" });
  }
};

const register = async (req, res, next) => {
  try {
    const { email, password, repeatPassword } = req.body;
    if (!email || !password) return res.json({ err: ALL_FIELDS_REQUIRED });
    const { isError, msg } = passwordValidate(password, repeatPassword);
    if (isError) return res.json({ err: msg });
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ err: "User with this email exists" });

    const hashedPassword = await hashPassword(password);
    const avatarUrl =
      req.protocol + "://" + req.get("host") + `/public/avatars/`;

    const user = await new User({
      email,
      password: hashedPassword,
      avatar: req.file
        ? avatarUrl + req.file.filename
        : avatarUrl + "default.png",
      isAuthenticated: false,
    }).save();
    const token = await createVerificationToken(user._id);

    const url = `${process.env.BASE_URL}auth/${user.id}/verify/${token.token}`;

    await sendEmail(
      user.email,
      "Verify account",
      `Verify your account \n${url}`
    );

    res.status(201).json({
      token,
      data: "User created, check your email and verify account!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(401).json({ err: ALL_FIELDS_REQUIRED });

    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ err: INVALID_CREDENTIALS });
    else if (user.isGoogleUser) {
      return res.status(400).json({ err: "You have to login via google" });
    }

    const decryptedPassword = await bcrypt.compare(password, user.password);

    if (!decryptedPassword)
      return res.status(401).json({ err: INVALID_CREDENTIALS });

    const token = createToken(user.id);

    res.status(200).json({
      data: { token, user },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const emailVerifyToken = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).json({ err: INVALID_LINK });

    const token = await findOldToken(user._id, req.params.token);
    if (!token) return res.status(400).json({ err: INVALID_LINK });

    await User.findOneAndUpdate({ _id: user._id }, { isAuthenticated: true });
    await token.remove();

    res.status(200).json({ data: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const resendToken = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ err: "Account does not exist" });
    const tokenOld = await findOldToken(user._id);
    if (tokenOld) {
      tokenOld.remove();
    }
    const token = await createVerificationToken(user._id);

    const url = `${process.env.BASE_URL}auth/${user.id}/verify/${token.token}`;
    await sendEmail(
      user.email,
      "Account Verification - Resend",
      `Verify your account \n${url}`
    );
    res.status(200).json({ data: "Email token resent" });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ err: "Invalid Email" });
    if (!user.isAuthenticated)
      return res
        .status(400)
        .json({ err: "Unauthorized user cannot reset password" });
    else if (user.isGoogleUser) {
      return res.status(400).json({
        err: "This account was created via google, password cannot be changed",
      });
    }

    const oldToken = await findOldToken(user._id);

    if (oldToken) {
      await oldToken.remove();
    }
    const token = await createVerificationToken(user._id);
    const url = `${process.env.BASE_URL}forgot-password/${user.id}/verify/${token.token}`;

    await sendEmail(
      user.email,
      "Forgot Password",
      `Open link and create new password \n${url}`
    );
    res.status(200).json({ data: "Check your email, and reset password" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const forgotPasswordVerify = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
    });

    if (!user) return res.status(404).json({ err: INVALID_LINK });
    console.log(user);
    const token = await findOldToken(user._id, req.params.token);
    console.log(token);
    if (!token) return res.status(404).json({ err: INVALID_LINK });
    res.status(200).json({ data: token });
  } catch (err) {
    console.log(err);
    res.status(404).json({ err: INVALID_LINK });
  }
};

const forgotPasswordReset = async (req, res) => {
  try {
    const { password, repeatPassword } = req.body;
    const { isError, msg } = passwordValidate(password, repeatPassword);
    if (isError) return res.json({ err: msg });
    const hashedPassword = await hashPassword(password);
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { password: hashedPassword }
    );
    const oldToken = await findOldToken(user._id);
    if (oldToken) {
      await oldToken.remove();
    }

    res.status(200).json({ data: "Password changed" });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const changePassword = async (req, res) => {
  try {
    const { password, repeatPassword, newPassword } = req.body;
    const { id } = req.user;
    const user = await bcrypt.compare(password, user.password);

    const isPasswordCorrect = false;
    if (!isPasswordCorrect) {
      return res.status(401).json({ err: "Incorrect password" });
    } else if (isPasswordCorrect && password === repeatPassword) {
      return res.status(401).json({ err: "Password is the same" });
    }

    const { isError, msg } = passwordValidate(newPassword, repeatPassword);
    if (isError) return res.json({ err: msg });
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ data: "Password changed", user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const changeEmail = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    const { newEmail, password } = req.body;

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ err: "Incorrect password" });
    }
    if (newEmail === user.email) {
      return res.status(401).json({ err: "Email is the same" });
    } else if (!isEmail(newEmail)) {
      return res.status(401).json({ err: "Incorrect email" });
    }
    user.email = newEmail;
    await user.save();
    res.status(200).json({ data: "Email changed", user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

module.exports = {
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
};
