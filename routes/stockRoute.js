const express = require("express");
const router = express.Router();

const {
  showPortfolio,
  addAsset,
  addStock,
} = require("../controller/stockRoute");

router.route("/portfolio").get(showPortfolio).post(addAsset);

router.post("/addStock", addStock);

module.exports = router;
