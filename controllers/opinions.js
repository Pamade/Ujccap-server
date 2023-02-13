const { User } = require("../models/user");
const { INTERNAL_ERROR } = require("../utils/errors");
const setOpinions = async (req, res) => {
  try {
    const { userId, type } = req.params;
    const loggedUserId = req.user.id;
    if (userId === loggedUserId) {
      return res.status(401).json({ err: "You cant reveiew yourself" });
    }
    if (!loggedUserId) {
      return res.status(401).json({ err: "You have to be logged in" });
    }
    const user = await User.findOne({ _id: userId });
    const isReviewedByUser =
      user.opinionsFromUsers.opinionsUserIds.includes(loggedUserId);

    if (isReviewedByUser) {
      return res
        .status(401)
        .json({ err: "You can reveiw this user only once" });
    }
    user.opinionsFromUsers[type] += 1;
    user.opinionsFromUsers.opinionsUserIds.push(loggedUserId);
    await user.save();

    res.status(200).json({ data: "Review added" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

module.exports = { setOpinions };
