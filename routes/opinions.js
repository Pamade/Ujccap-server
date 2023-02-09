const express = require("express");
const router = express.Router();
const { setOpinions } = require("../controllers/opinions");
const userAuth = require("../middlewares/userAuth");

router.patch("/set/:userId/:type", userAuth, setOpinions);

module.exports = router;
