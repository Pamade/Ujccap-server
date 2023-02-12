const { fetch, currentDate } = require("../utils/fetchOffer");
const Offer = require("../models/offer");
const { User } = require("../models/user");
const { INTERNAL_ERROR } = require("../utils/errors");
const { ObjectId } = require("mongoose").Types;

const fetchOffersMainPage = async (req, res) => {
  try {
    const { count, offers } = await fetch(req, res, true, {
      expirationDate: { $gt: currentDate },
    });

    res.status(200).json({ data: { offers, count } });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const fetchOffersCategory = async (req, res) => {
  try {
    const { categories } = req.params;
    const { offers, count } = await fetch(req, res, true, {
      expirationDate: { $gt: currentDate },
      categories: { $in: categories },
    });

    res.status(200).json({ data: { offers, count } });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const fetchWithUserId = async (req, res, allowQuery) => {
  try {
    const { userId } = req.params;

    const { offers, count } = await fetch(req, res, allowQuery, {
      expirationDate: { $gt: currentDate },
      user: userId,
    });
    const user = await User.findOne({ _id: userId });
    res.status(200).json({ data: { offers, count, user } });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const fetchOfferAndSimillar = async (req, res) => {
  const cd = new Date().getTime();
  try {
    const limit = 3;
    const { offerId, userAuthId } = req.params;

    const mainOffer = await Offer.findOne({
      _id: offerId,
      expirationDate: { $gt: currentDate },
    }).populate("user");

    if (userAuthId && mainOffer.user._id.toString() !== userAuthId) {
      await User.findOneAndUpdate(
        { _id: userAuthId, "recentlyWatched.id": ObjectId(offerId) },
        { $pull: { recentlyWatched: { id: ObjectId(offerId) } } }
      );

      await User.findOneAndUpdate(
        { _id: ObjectId(userAuthId) },
        {
          $push: {
            recentlyWatched: {
              id: ObjectId(offerId),
              watchedTime: cd,
            },
          },
        },
        { new: true }
      );
    }

    const user = await User.findById(ObjectId(mainOffer.user._id));
    const offersUser = await Offer.find({
      _id: { $ne: ObjectId(offerId) },
      user: mainOffer.user._id,
      expirationDate: { $gt: currentDate },
    })
      .limit(limit)
      .populate("user");

    let offersCategories = await Offer.find({
      user: { $ne: ObjectId(mainOffer.user._id) },
      _id: { $ne: ObjectId(offerId) },
      categories: { $in: mainOffer.categories },
      expirationDate: { $gt: currentDate },
    })
      .limit(limit)
      .populate("user");

    res.status(200).json({
      data: {
        mainOffer,
        offersUser,
        offersCategories,
      },
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const fetchUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

module.exports = {
  fetchOffersMainPage,
  fetchOffersCategory,
  fetchOfferAndSimillar,
  fetchWithUserId,
  fetchUser,
};
