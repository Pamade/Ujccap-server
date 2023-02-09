const express = require("express");
const router = express.Router();

const { fetchUsers } = require("../controllers/anyUser");

router.get("/search/:search", fetchUsers);

module.exports = router;
