const express = require("express");
const router = express.Router();

const {
  showPortfolio,
  addAsset,
  addStock,
  isLoggedIn,
} = require("../controller/stockRoute");

// Routing for portfolio page and asset adding confirmation page
router
  .route("/portfolio")
  .get(isLoggedIn, showPortfolio)
  .post(isLoggedIn, addAsset);

// Routing for adding asset to the database from the confirmation page
router.post("/addStock", isLoggedIn, addStock);

module.exports = router;
