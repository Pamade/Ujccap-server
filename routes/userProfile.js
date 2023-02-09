const express = require("express");
const router = express.Router();
const multer = require("multer");
const { updateAvatar } = require("../controllers/userProfile");
const { storage } = require("../utils/user");

const upload = multer({ storage });

router.patch("/updateAvatar", upload.single("avatar"), updateAvatar);

module.exports = router;
