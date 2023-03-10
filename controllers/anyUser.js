const { INTERNAL_ERROR } = require("../utils/errors");
const { User } = require("../models/user");

const fetchUsers = async (req, res, next) => {
  try {
    const { search } = req.params;
    const users = await User.find({
      $or: [
        { email: { $regex: `^${search}`, $options: "i" } },
        { "seller.name": { $regex: `^${search}`, $options: "i" } },
      ],
    }).limit(5);

    res.status(200).json({ data: users });
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};
module.exports = { fetchUsers };
