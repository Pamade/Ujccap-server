const { User } = require("../models/user");
const _ = require("lodash");

const { INTERNAL_ERROR } = require("../utils/errors");

const createSeller = async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id);
    user.seller = req.body;
    await user.save();
    return res
      .status(200)
      .json({ data: "Now you can start selling", user: user });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const updateSeller = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const seller = user.seller._doc;

    const sellerOld = _.omit(seller, ["_id"]);
    const sellerNew = _.omit(req.body, ["_id"]);

    for (const val in sellerNew) {
      if (!sellerNew[val]) {
        return res.status(401).json({ err: `${val} is required` });
      }
    }

    if (_.isEqual(sellerOld, sellerNew)) {
      return res.status(401).json({ err: "Ale fields are the same" });
    }

    user.seller = sellerNew;
    await user.save();

    res.status(200).json({ data: "Informations Updated", user: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

module.exports = { createSeller, updateSeller };
