const Offer = require("../models/offer");
const { User } = require("../models/user");
const _ = require("lodash");
const { INTERNAL_ERROR } = require("../utils/errors");
const { fetch, limit, currentDate } = require("../utils/fetchOffer");
const sharp = require("sharp");
const unique = new Date().getTime();
const fs = require("fs");
const path = require("path");

const imageResize = async (buffer, name) => {
  const directory = path.join("./public/offers", name);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  await sharp(buffer)
    .resize({
      fit: sharp.fit.cover,
      width: 900,
    })
    .toFile(directory);
};

const fetchOffersProfile = async (req, res) => {
  try {
    const { count, offers } = await fetch(req, res, false, {
      expirationDate: { $gt: currentDate },
      user: req.user.id,
    });
    res.json({ data: { offers, count } });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const fetchOffersAll = async (req, res) => {
  try {
    const { count, offers } = await fetch(req, res, true, {
      user: req.user.id,
    });
    res.json({ data: { offers, count } });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const fetchUserFavouritesProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id }).select("favourites");
    const userFavourites = user.favourites;
    const offers = await Offer.find({
      _id: { $in: userFavourites },
      expirationDate: { $gt: currentDate },
    })
      .populate("user")
      .limit(limit);

    res.json({ data: { offers } });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const fetchUserFavouritesAll = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id }).select("favourites");
    const userFavourites = user.favourites;
    const { offers, count } = await fetch(req, res, true, {
      _id: { $in: userFavourites },
      expirationDate: { $gt: currentDate },
    });
    res.json({ data: { offers, count } });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const fetchOffer = async (req, res) => {
  try {
    const data = await Offer.findOne({
      _id: req.params.offerId,
      userId: req.user.id,
    });

    !data && res.status(404).json({ err: "Not found" });
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const addOffer = async (req, res) => {
  try {
    let mainImageURL = "";
    const mainImage = req.files["main-image-offer"]
      ? req.files["main-image-offer"][0]
      : null;

    const imagesNotMain = req.files["image-offer"]
      ? req.files["image-offer"]
      : null;

    const host = req.protocol + "://" + req.get("host");
    const imageUrl = req.protocol + "://" + req.get("host") + "/public/offers/";
    const uniqueNameMain = mainImage
      ? `${unique}-${mainImage.originalname}`
      : "";

    const { name, description, price, categories, location, expirationDate } =
      req.body;

    if (mainImage) {
      imageResize(mainImage.buffer, uniqueNameMain);
    }
    if (imagesNotMain) {
      imagesNotMain.map((image) => {
        imageResize(image.buffer, `${unique}-${image.originalname}`);
      });
    }

    const imagesURLS = imagesNotMain
      ? imagesNotMain.map(
          (image) => imageUrl + `${unique}-${image.originalname}`
        )
      : [];

    if (mainImage) {
      mainImageURL = host + "/public/offers/" + uniqueNameMain;
    } else if (!mainImage && imagesNotMain) {
      mainImageURL = imagesURLS[0];
      imagesURLS.shift();
    } else {
      mainImageURL = imageUrl + "placeholder_offer.png";
    }

    await Offer.create({
      user: req.user.id,
      name,
      mainImage: mainImageURL,
      description,
      price,
      images: imagesURLS,
      categories: categories.split(","),
      location,
      expirationDate,
    });
    res.status(201).json({ data: "Offer added" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const updateOffer = async (req, res) => {
  let {
    mainImage,
    name,
    description,
    price,
    categories,
    location,
    images,
    indexes,
    indexesRemoved,
    expirationDate,
  } = req.body;

  try {
    const imageUrl = req.protocol + "://" + req.get("host") + "/public/offers/";
    let mainImageNew = req.files["main-image-offer"]
      ? req.files["main-image-offer"][0]
      : mainImage;
    const indexesImagesChanged = Array.isArray(indexes)
      ? indexes.map((item) => parseInt(item))
      : [parseInt(indexes)];

    let offerOld = await Offer.findOne({ _id: req.params.offerId });
    const old = _.pick(offerOld, [
      "mainImage",
      "name",
      "description",
      "price",
      "categories",
      "location",
      "images",
    ]);

    const newImagesNotMain = req.files["image-offer"];
    if (newImagesNotMain) {
      newImagesNotMain.forEach((image) =>
        imageResize(image.buffer, `${unique}-${image.originalname}`)
      );
    }

    const linksForNewImages =
      newImagesNotMain &&
      newImagesNotMain.map(
        (image) => imageUrl + `${unique}-${image.originalname}`
      );

    const imagesCurrent = images.split(",");

    const indexesRemovedImages =
      indexesRemoved && indexesRemoved.split("").map((item) => Number(item));

    indexesRemovedImages &&
      indexesRemovedImages.forEach((item) => (imagesCurrent[item - 1] = ""));

    indexesImagesChanged &&
      indexesImagesChanged.map(async (itemIndex, i) => {
        if (isNaN(itemIndex)) return;
        else if (itemIndex === 0) {
          const imagePath = unique + "-" + mainImageNew.originalname;
          imageResize(mainImageNew.buffer, imagePath);
          mainImageNew = imageUrl + `${unique}-${mainImageNew.originalname}`;
        } else if (!indexesImagesChanged.includes(0)) {
          imagesCurrent[itemIndex - 1] = linksForNewImages[i];
        } else {
          imagesCurrent[itemIndex - 1] = linksForNewImages[i - 1];
        }
      });
    const updatedOffer = {
      mainImage: mainImageNew,
      name,
      description,
      price: Number(price),
      categories: categories.split(","),
      location,
      images: imagesCurrent,
      expirationDate: expirationDate ? expirationDate : offerOld.expirationDate,
    };

    if (_.isEqual(old, updatedOffer)) {
      //sending in array bcs alert expects array type
      return res.status(401).json({ err: ["All fields are the same"] });
    } else {
      await Offer.findByIdAndUpdate(req.params.offerId, updatedOffer);
      return res.status(200).json({ data: "Offer Updated" });
    }
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const deleteOffer = async (req, res, next) => {
  try {
    await Offer.findOneAndDelete({
      _id: req.params.offerId,
      userId: req.user.id,
    });

    return res.status(200).json({ data: "Offer Deleted" });
  } catch (err) {
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

const fetchRecentlyWatched = async (req, res) => {
  try {
    const limit = 3;
    const { userId } = req.params;
    console.log(userId);
    let recentlyWatchedDoc = await User.findOne({
      _id: userId,
      expirationDate: { $gt: currentDate },
    }).select("recentlyWatched");

    let recentlyWatched = recentlyWatchedDoc.recentlyWatched.slice(-limit);

    const recentlyWatchedIDs = recentlyWatched.map((item) => item.id);

    let offers = await Offer.find({
      _id: { $in: recentlyWatchedIDs },
      expirationDate: { $gt: currentDate },
    })
      .populate("user")
      .limit(limit);

    offers = offers.reverse();
    const offersRecent = recentlyWatched.map((recently) => {
      const offerWithId = offers.find(
        (off) => off._id.toString() === recently.id.toString()
      );

      const val = {
        ...offerWithId._doc,
        recentlyWatchedByUser: recently.watchedTime,
      };
      return val;
    });

    const sortedOffers = offersRecent.sort(
      (a, b) => b.recentlyWatchedByUser - a.recentlyWatchedByUser
    );

    res.json({ data: { offers: sortedOffers } });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: INTERNAL_ERROR });
  }
};

module.exports = {
  addOffer,
  fetchOffersProfile,
  fetchUserFavouritesProfile,
  fetchUserFavouritesAll,
  fetchOffersAll,
  fetchOffer,
  updateOffer,
  deleteOffer,
  fetchRecentlyWatched,
};
