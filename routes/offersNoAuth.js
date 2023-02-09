const express = require("express");
const router = express.Router();
const {
  fetchOfferAndSimillar,
  fetchOffersCategory,
  fetchOffersMainPage,
  fetchWithUserId,
  fetchUser,
} = require("../controllers/offersNoAuth");

router.get("/fetch-offers-user-id/:userId", async (req, res) => {
  await fetchWithUserId(req, res, true);
});
router.get("/fetch-offers-user-id-profile/:userId", async (req, res) => {
  await fetchWithUserId(req, res, false);
});

router.get("/fetch-offers-categories/:categories", fetchOffersCategory);
router.get("/fetch-offers-main-page", fetchOffersMainPage);
router.get(
  "/fetch-offer-and-simillar/:offerId/:userAuthId",
  fetchOfferAndSimillar
);
router.get("/userExist/:userId", fetchUser);

module.exports = router;
