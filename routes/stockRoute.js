const express = require("express");
const router = express.Router();

const {
  showPortfolio,
  addAsset,
  addStock,
  isLoggedIn,
  updateAssets,
} = require("../controller/stockRoute");

const { getSymbolUS } = require("../Utility Functions/apiHelperFn");

// Routing for portfolio page and asset adding confirmation page
router
  .route("/portfolio")
  .get(isLoggedIn, showPortfolio)
  .post(isLoggedIn, addAsset);

// Routing for adding asset to the database from the confirmation page
router.post("/addStock", isLoggedIn, addStock);

// Updating custom asset current price
router.route("/updateStock").post((req, res) => {
  const { stockName } = req.body;
  res.render("updateCustomAsset", {
    stockName,
    pageClass: "portfolioPage",
    showLogin: false,
    showReg: false,
    titleName: "CONFIRM!!!",
  });
});

// Updating custom asset current price into db
router.post("/updateAsset", updateAssets);

module.exports = router;
