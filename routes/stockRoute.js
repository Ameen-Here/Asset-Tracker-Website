const express = require("express");
const router = express.Router();

const {
  showPortfolio,
  addAsset,
  addStock,
} = require("../controller/stockRoute");

// Routing for portfolio page and asset adding confirmation page
router.route("/portfolio").get(showPortfolio).post(addAsset);

// Routing for adding asset to the database from the confirmation page
router.post("/addStock", addStock);

module.exports = router;
