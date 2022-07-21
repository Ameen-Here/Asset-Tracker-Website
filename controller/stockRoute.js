const User = require("../models/User");

// MS val of a day to update values when last update exceeds a day
const { MILLISECOND } = require("../Utility Functions/testData");

const { getAsset, getTestDatas } = require("./userData");
const { updatePrice, updateDataBase } = require("./databaseHandler");

const { normalAssetBuilder, customAssetBuilder } = require("./templateBuilder");

let tempState = {}; // For holding temporary value when adding a stock before confirmation

const dt = new Date(); // for checking last update

const updatePortfolioAssets = async (datas) => {
  const curTime = dt.getTime(); // Getting current time to determine whether to update or not
  const assets = datas.assets;
  for (let i = 0; i < assets.length; i++) {
    // Checking if assets need to be updated or not
    const asset = getAsset(datas, i);
    const timeDiff = curTime - asset.updateTime;
    if (asset.isCustomAsset || timeDiff < MILLISECOND) continue;
    console.log(assets);
    await updatePrice(asset.stockName, i, curTime); // Updating current price and updated time
  }
};

renderPortfolioLists = (assets) => {
  let i = 0;
  let topGainers = [];
  // Array of asset name and it's %value sorted descending
  const datasPerformer = assets
    .map((company) => ({
      value: company.pAndLossPerc,
      name: company.stockName,
    }))
    .sort((a, b) => b.value - a.value);

  // Getting utmost top 3 or available
  for (let value of datasPerformer) {
    if (i === 3) break;
    topGainers.push({ ...value, i });
    i++;
  }
  return topGainers;
};

const showPortfolio = async (req, res) => {
  const testData = await getTestDatas();
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
};
