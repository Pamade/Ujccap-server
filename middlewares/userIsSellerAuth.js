const { User } = require("../models/user");
const { INTERNAL_ERROR } = require("../utils/errors");
const userIsSellerAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.seller)
      return res.status(401).json({ err: "You are already a seller" });

    next();
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

module.exports = userIsSellerAuth;
