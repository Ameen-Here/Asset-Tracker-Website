const { getTestDatas } = require("../models/userHandler");
const { updateDataBase } = require("../models/dataBaseHandler");

const { normalAssetBuilder, customAssetBuilder } = require("./templateBuilder");

const {
  updatePortfolioAssets,
  renderPortfolioLists,
} = require("./renderHelper");

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // req.flash("error", "you must be signed in")
    return res.redirect("/login");
  }
  next();
};

let tempState = {}; // For holding temporary value when adding a stock before confirmation

// Controllers

const showPortfolio = async (req, res) => {
  const currentUserEmail = req.user.email;
  const testData = await getTestDatas(currentUserEmail);
  console.log("this doesnt worked");
  const assets = testData.assets;
  await updatePortfolioAssets(testData); // Will update stock price if needed
  const topGainers = renderPortfolioLists(assets); // Render a list of top 3 stocks

  res.render("portfolio", {
    pageClass: "portfolioPage",
    showLogin: false,
    showReg: false,
    titleName: "Portfolio",
    testData: assets,
    stockLabel: assets.map((data) => data.stockName),
    stockValue: assets.map((data) => data.totalValue),
    topGainers,
  });
};

const addAsset = async (req, res) => {
  if (req.body.action === "cancel") return; // Check if the user pressed cancel.

  const { noOfStock, symbol, currentPrice, stockName } = tempState;

  await updateDataBase(
    "Ameen Noushad",
    symbol,
    +noOfStock,
    currentPrice,
    stockName,
    tempState
  );

  res.redirect("/portfolio");
};

const addStock = async (req, res) => {
  const { format, company, asset } = req.body;

  if (format === "NormalAsset") {
    tempState = await normalAssetBuilder(company, tempState);
  } else tempState = await customAssetBuilder(asset, tempState);

  res.render("addStock", {
    stockName: tempState.symbol,
    quantity: tempState.noOfStock,
    stockPrice: tempState.currentPrice,
    pageClass: "portfolioPage",
    showLogin: false,
    showReg: false,
    titleName: "CONFIRM!!!",
  });
};

module.exports = {
  showPortfolio,
  addAsset,
  addStock,
  isLoggedIn,
};
