const { getTestDatas } = require("../models/userHandler");
const { updateDataBase } = require("../models/dataBaseHandler");
const { setCurrentUser, getCurrentUser } = require("../config/currentUser");
const { findPercentage } = require("../Utility Functions/stockCalc");

const { normalAssetBuilder, customAssetBuilder } = require("./templateBuilder");

const {
  catchAsync,
  isNormalAssetValid,
  isCustomAssetValid,
} = require("../Utility Functions/errorHandler");
const { getIndex } = require("../Utility Functions/stockCalc");

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
  if (req.body.action === "cancel") return res.redirect("/portfolio"); // Check if the user pressed cancel.

  const { noOfStock, symbol, currentPrice, stockName, exchange } = tempState;

  console.log(tempState);
  console.log("././././././");
  console.log(exchange);

  const testData = getCurrentUser(req.user);
  await updateDataBase(
    "Ameen Noushad",
    symbol,
    +noOfStock,
    currentPrice,
    stockName,
    tempState,
    req.user,
    testData,
    exchange
  );

  res.redirect("/portfolio");
});

const addStock = catchAsync(async (req, res) => {
  const { format, company, asset, exchange } = req.body;
  let isFormValid = true;
  console.log("here");

  // Error checking if the form is filled
  if (format === "NormalAsset") isFormValid = isNormalAssetValid(company);
  if (format === "customAsset") isFormValid = isCustomAssetValid(asset);
  console.log("here after isNormal");
  if (!isFormValid) {
    req.flash("error", "Please fill all the inputs before submitting");
    return res.redirect("/portfolio");
  }
  if (format === "NormalAsset") {
    tempState = await normalAssetBuilder(
      company,
      tempState,
      req.user,
      exchange
    );
  } else tempState = await customAssetBuilder(asset, tempState, req.user);

  console.log("after builder");
  console.log(tempState);
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

// When custom asset current value is updated
const updateAssets = catchAsync(async (req, res) => {
  if (req.body.action === "cancel") return res.redirect("/portfolio");
  const { stockName, currentPrice } = req.body;
  const testDatas = getCurrentUser(req.user);

  const desiredValue = testDatas.assets.filter((asset) => {
    return asset.stockName === stockName.trim();
  })[0];
  // Updating values
  desiredValue.currentPrice = currentPrice;
  desiredValue.totalValue = desiredValue.noOfStock * currentPrice;
  desiredValue.pAndLossPerc = findPercentage(
    desiredValue.testStockPrice,
    currentPrice
  );
  // finding index to insert to array
  const index = getIndex(testDatas, stockName.trim());
  testDatas.assets.splice(index, 1, desiredValue);
  await testDatas.save();
  res.redirect("/portfolio");
});

module.exports = {
  showPortfolio,
  addAsset,
  addStock,
  isLoggedIn,
  updateAssets,
};
