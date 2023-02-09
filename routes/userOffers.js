const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const validateFields = require("../middlewares/validateFields");
const userVerifiedCanSell = require("../middlewares/userVerifiedCanSell");
const {
  addOffer,
  fetchOffersProfile,
  fetchOffersAll,
  fetchOffer,
  updateOffer,
  deleteOffer,
  fetchUserFavouritesProfile,
  fetchUserFavouritesAll,
  fetchRecentlyWatched,
} = require("../controllers/userOffers");

const offersFields = [
  { name: "name", maxLength: 50, label: "Name" },
  { name: "price", maxLength: 35, label: "Price" },
  { name: "description", maxLength: 500, label: "Description" },
  { name: "categories", label: "Categories" },
  { name: "location", maxLength: 35, label: "Location" },
];

router.get("/fetch-offers-user-profile", fetchOffersProfile);
router.get("/fetch-offers-user-favourties-profile", fetchUserFavouritesProfile);
router.get("/fetch-offers-user-favourties-all", fetchUserFavouritesAll);
router.get("/fetch-offers-all", fetchOffersAll);
router.get("/fetch-offer/:offerId", fetchOffer);
router.get("/fetch-offers-recently-watched/:userId", fetchRecentlyWatched);
router.post(
  "/add-offer",
  upload.fields([
    { name: "main-image-offer", maxCount: 1 },
    { name: "image-offer", maxCount: 5 },
  ]),
  userVerifiedCanSell,
  validateFields(offersFields),
  addOffer
);

router.put(
  "/update-offer/:offerId",
  upload.fields([
    { name: "main-image-offer", maxCount: 1 },
    { name: "image-offer", maxCount: 5 },
  ]),
  userVerifiedCanSell,
  validateFields(offersFields),
  updateOffer
);

router.delete("/delete-offer/:offerId", userVerifiedCanSell, deleteOffer);

module.exports = router;
