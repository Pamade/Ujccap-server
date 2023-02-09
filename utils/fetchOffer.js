const Offer = require("../models/offer");

const currentDate = new Date();
const limit = 6;
const fetch = async (req, res, allowQueryFilters, data) => {
  let {
    page,
    hasImage,
    name,
    priceFrom,
    priceTo,
    categories,
    sort,
    location,
    showExpired,
  } = req.query;

  let queryObject = {};
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (location) {
    queryObject.location = { $regex: location, $options: "i" };
  }
  if (priceFrom) {
    queryObject.price = { ...queryObject.price, $gte: Number(priceFrom) };
  }
  if (priceTo) {
    queryObject.price = { ...queryObject.price, $lte: Number(priceTo) };
  }
  if (categories) {
    queryObject.categories = { $all: categories.split(",") };
  }
  if (!showExpired) {
    queryObject.expirationDate = {
      $gt: currentDate,
    };
  }
  if (hasImage) {
    queryObject.mainImage = {
      $ne: "http://localhost:5001/public/offers/placeholder_offer.png",
    };
  }
  console.log(queryObject);
  if (!allowQueryFilters) {
    queryObject = {};
    page = 1;
  }
  const perPage = page ? limit : undefined;
  const skip = page ? (Number(page) - 1) * perPage : undefined;
  const sortValues = sort ? sort.replaceAll(",", " ") : "-createdAt";

  const count = await Offer.countDocuments({ ...data, ...queryObject });
  const offers = await Offer.find({ ...data, ...queryObject })
    .populate("user")
    .collation({ locale: "en" })
    .sort(sortValues)
    .skip(skip)
    .limit(perPage);

  return { count, offers };
};

module.exports = { fetch, limit, currentDate };
