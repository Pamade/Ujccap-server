const express = require("express");
const router = express.Router();

const { updateFavourites } = require("../controllers/favourites");

router.patch("/update/:offerId", updateFavourites);

module.exports = router;
