const { getTestDatas } = require("../models/userHandler");
const { updateDataBase } = require("../models/dataBaseHandler");
const { setCurrentUser, getCurrentUser } = require("../config/currentUser");

const { normalAssetBuilder, customAssetBuilder } = require("./templateBuilder");

const catchAsync = require("../Utility Functions/errorHandler");

const {
  updatePortfolioAssets,
  renderTopAsset,
  renderTotalValue,
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

const showPortfolio = catchAsync(async (req, res) => {
  const currentUserEmail = req.user.email;
  const testData = await getTestDatas(currentUserEmail);
  setCurrentUser(testData);
  const assets = testData.assets;
  await updatePortfolioAssets(testData); // Will update stock price if needed
  const topGainers = renderTopAsset(assets); // Render a list of top 3 stocks

  const totalInfo = renderTotalValue(assets);

  res.render("portfolio", {
    pageClass: "portfolioPage",
    showLogin: false,
    showReg: false,
    titleName: "Portfolio",
    testData: assets,
    stockLabel: assets.map((data) => data.stockName),
    stockValue: assets.map((data) => data.totalValue),
    topGainers,
    totalInfo,
  });
});

const addAsset = catchAsync(async (req, res) => {
  if (req.body.action === "cancel") return; // Check if the user pressed cancel.

  const { noOfStock, symbol, currentPrice, stockName } = tempState;

  const testData = getCurrentUser(req.user);
  await updateDataBase(
    "Ameen Noushad",
    symbol,
    +noOfStock,
    currentPrice,
    stockName,
    tempState,
    req.user,
    testData
  );

  res.redirect("/portfolio");
});
const addStock = catchAsync(async (req, res) => {
  const { format, company, asset } = req.body;

  if (format === "NormalAsset") {
    tempState = await normalAssetBuilder(company, tempState, req.user);
  } else tempState = await customAssetBuilder(asset, tempState, req.user);

  res.render("addStock", {
    stockName: tempState.symbol,
    quantity: tempState.noOfStock,
    stockPrice: tempState.currentPrice,
    pageClass: "portfolioPage",
    showLogin: false,
    showReg: false,
    titleName: "CONFIRM!!!",
  });
});

module.exports = {
  showPortfolio,
  addAsset,
  addStock,
  isLoggedIn,
};
