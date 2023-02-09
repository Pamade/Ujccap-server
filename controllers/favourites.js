const { User } = require("../models/user");
const { INTERNAL_ERROR } = require("../utils/errors");

const currentDate = new Date();

const updateFavourites = async (req, res) => {
  try {
    const { offerId } = req.params;
    const user = await User.findOne({ _id: req.user.id });
    const index = user.favourites.indexOf(offerId);
    if (index !== -1) {
      user.favourites.splice(index, 1);
    } else {
      user.favourites.push(offerId);
    }
    await user.save();
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const fetchFavourites = async (req, res) => {
  try {
    let offers = await User.findOne({ _id: req.user.id })
      .populate({
        path: "favourites",
        match: { expirationDate: { $gt: currentDate } },
      })
      .select("favourites");

    offers = offers.favourites;

    res.status(200).json({ data: offers, sta });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

module.exports = { updateFavourites, fetchFavourites };
