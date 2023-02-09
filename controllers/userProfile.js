const { User } = require("../models/user");
const { INTERNAL_ERROR } = require("../utils/errors");

const updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const url =
      req.protocol +
      "://" +
      req.get("host") +
      `/public/avatars/` +
      req.file.filename;

    user.avatar = url;
    await user.save();

    res.status(200).json({ data: "Avatar Changed", user: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

module.exports = { updateAvatar };
