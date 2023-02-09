const { User } = require("../models/user");
const { INTERNAL_ERROR } = require("../utils/errors");
const userVerifiedCanSell = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.seller)
      return res.status(401).json({ err: "Only verified user can sell" });
    next();
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

module.exports = userVerifiedCanSell;
