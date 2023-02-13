const { User } = require("../models/user");
const setOpinions = async (req, res) => {
  try {
    const { userId, type } = req.params;
    if (!userId) {
      return res.status(401).json({ err: "You have to be logged in" });
    }
    if (userId === req.user.id) {
      return res.status(401).json({ err: "You cant reveiew yourself" });
    }
    const user = await User.findOne({ _id: userId });
    const isReviewedByUser = user.opinionsFromUsers.opinionsUserIds.includes(
      req.user.id
    );

    if (isReviewedByUser) {
      return res
        .status(401)
        .json({ err: "You can reveiw this user only once" });
    }
    user.opinionsFromUsers[type] += 1;
    user.opinionsFromUsers.opinionsUserIds.push(req.user.id);
    await user.save();

    res.status(200).json({ x: "[" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ x: "[" });
  }
};

// const getOpinions = async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     const user = await User.findOne({ _id: userId });

//     // console.log(rest);
//     res.status(200).json(user);
//     next();
//   } catch (err) {}
// };

module.exports = { setOpinions };
