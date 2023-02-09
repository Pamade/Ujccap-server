const express = require("express");
const router = express.Router();

const userAuth = require("../middlewares/userAuth");
const userIsSellerAuth = require("../middlewares/userIsSellerAuth");
const userVerifiedCanSell = require("../middlewares/userVerifiedCanSell");
const validateFields = require("../middlewares/validateFields");
const { createSeller, updateSeller } = require("../controllers/userSeller");
const userSellerFields = [
  {
    name: "name",
    maxLength: 35,
    label: "Name",
  },
  { name: "surname", maxLength: 35, label: "Surname" },
  { name: "phoneNumber", maxLength: 35, label: "Phone Number" },
  { name: "postCode", maxLength: 35, label: "Post Code" },
  { name: "city", maxLength: 35, label: "City" },
  { name: "address", maxLength: 35, label: "Address" },
];

router.post(
  "/createSeller",
  userAuth,
  validateFields(userSellerFields),
  userIsSellerAuth,
  createSeller
);

router.put(
  "/updateSeller",
  userAuth,
  userVerifiedCanSell,
  validateFields(userSellerFields),
  updateSeller
);

module.exports = router;
