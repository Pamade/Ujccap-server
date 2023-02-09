const express = require("express");
const router = express.Router();

const {
  updateFavourites,
  fetchFavourites,
} = require("../controllers/favourites");

// router.get("/fetch", fetchFavourites);
router.patch("/update/:offerId", updateFavourites);

module.exports = router;
